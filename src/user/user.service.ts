import { ConfigService } from '@nestjs/config';
import { EmailAuthService } from './../auth/email-auth.service';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateUserOAtuhDto } from './dto/create-user-oauth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';
import { GetUserDto } from './dto/get-user.dto';
import { GetUsersAllDto } from './dto/get-users-all.dto';
import { Prisma } from '@prisma/client';
import { UserListResponseDto } from './dto/response/user-list-response.dto';
import { BcryptService } from 'src/auth/bcrypt.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    @Inject(forwardRef(() => EmailAuthService))
    private readonly emailAuthService: EmailAuthService,
    private readonly configService: ConfigService,
  ) {}

  async getUser(
    dto: GetUserDto,
    tx?: Prisma.TransactionClient,
  ): Promise<UserEntity | null> {
    if (!dto.idx && !dto.nickname && !dto.email && !dto.pw) {
      return null;
    }

    const prisma = tx ?? this.prismaService;

    const userData = await prisma.accountTb.findFirst({
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },
      where: {
        idx: dto.idx,
        email: dto.email,
        nickname: dto.nickname,
        deletedAt: null,
      },
    });

    if (!userData) {
      return null;
    }

    return new UserEntity(userData);
  }

  async getUsersAll(dto: GetUsersAllDto): Promise<UserListResponseDto> {
    //or문이 빈배열이라면 쿼리에서 완전히 지워야한다.
    //prettier-ignore
    const totalCount = await this.prismaService.accountTb.count({
      where: {
        deletedAt: null,
        ...(dto.status === 'active' && { suspendExpireAt: null } ),
        ...(dto.status === 'suspended' && { suspendExpireAt: { not: null } } ),
        ...(dto.status === 'blackList' && { suspendExpireAt: { gte: new Date('2100-01-01') } } ),
        ...(dto.email || dto.nickname || dto.interest1 || dto.interest2)
          && {
              OR: [
                dto.email && { email: { contains: dto.email, mode: Prisma.QueryMode.insensitive } } ,
                dto.nickname && { nickname: { contains: dto.nickname, mode: Prisma.QueryMode.insensitive } } ,
                dto.interest1 && { interest1: { contains: dto.interest1, mode: Prisma.QueryMode.insensitive } } ,
                dto.interest2 && { interest2: { contains: dto.interest2, mode: Prisma.QueryMode.insensitive } } ,
              ].filter(Boolean),// null 값 제거
            }
        }  
    });

    const userData = await this.prismaService.accountTb.findMany({
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },

      // prettier-ignore
      where: {
        deletedAt: null,
        ...(dto.status === 'active' && { suspendExpireAt: null } ),
        ...(dto.status === 'suspended' && { suspendExpireAt: { not: null } } ),
        ...(dto.status === 'blackList' && { suspendExpireAt: { gte: new Date('2100-01-01') } } ),
        ...(dto.email || dto.nickname || dto.interest1 || dto.interest2)
          && {
              OR: [
                dto.email && { email: { contains: dto.email, mode: Prisma.QueryMode.insensitive } } ,
                dto.nickname && { nickname: { contains: dto.nickname, mode: Prisma.QueryMode.insensitive } } ,
                dto.interest1 && { interest1: { contains: dto.interest1, mode: Prisma.QueryMode.insensitive } } ,
                dto.interest2 && { interest2: { contains: dto.interest2, mode: Prisma.QueryMode.insensitive } } ,
              ].filter(Boolean),// null 값 제거
            }
        },

      orderBy: {
        idx: 'desc',
      },
      skip: dto.size * (dto.page - 1),
      take: dto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      users: userData.map((elem) => new UserEntity(elem)),
    };
  }

  async getUsersByIdx(userIdxs: string[]): Promise<UserEntity[]> {
    const users = await this.prismaService.accountTb.findMany({
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },
      where: {
        idx: {
          in: userIdxs,
        },
        deletedAt: null,
      },
    });

    return users.map((user) => new UserEntity(user));
  }

  async getUserPasswordByIdx(userIdx: string): Promise<string> {
    const user = await this.prismaService.accountTb.findUnique({
      select: {
        pw: true,
      },
      where: {
        idx: userIdx,
      },
    });

    return user.pw;
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    let newUser;
    await this.prismaService.$transaction(async (tx) => {
      const emailDuplicatedUser = await this.getUser({ email: dto.email }, tx);

      if (emailDuplicatedUser) {
        throw new ConflictException('Email Duplicated');
      }

      const authenticatedEmail =
        await this.emailAuthService.getEmailWithVerificationCode(
          dto.email,
          undefined,
          tx,
        );

      if (!authenticatedEmail || authenticatedEmail.isVerified !== true) {
        throw new UnauthorizedException('Unauthorized Email');
      }

      if (
        new Date().getTime() - authenticatedEmail.createdAt.getTime() >
        30 * 60 * 1000
      ) {
        throw new UnauthorizedException('Authentication TimeOut');
      }

      const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
      const salt = await this.bcryptService.genSalt(saltRounds);
      const hashedPw = await this.bcryptService.hash(dto.pw, salt);

      newUser = await this.prismaService.accountTb.create({
        data: {
          email: dto.email,
          pw: hashedPw,
          provider: 'local',
        },
      });

      newUser = await this.prismaService.accountTb.update({
        data: {
          nickname: newUser.serialNumber + '번째 오리',
        },
        where: {
          idx: newUser.idx,
        },
      });
    });

    await this.emailAuthService.deleteVerifiedEmail(dto.email);

    return await this.getUser({ idx: newUser.idx });
  }

  //serial_Number 반환하기위해 테이블형태로반환
  async createUserWithOAuth(dto: CreateUserOAtuhDto): Promise<UserEntity> {
    let userData;

    userData = await this.prismaService.accountTb.create({
      data: {
        email: dto.email,
        provider: dto.provider,
        providerKey: dto.providerKey,
      },
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },
    });
    return new UserEntity(userData);
  }

  async updateMyinfo(
    userIdx: string,
    dto: UpdateMyInfoDto,
  ): Promise<UserEntity> {
    const user = await this.getUser({
      idx: userIdx,
    });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const duplicatedUser = await this.getUser({
      nickname: dto.nickname,
    });

    if (duplicatedUser && duplicatedUser.nickname == dto.nickname) {
      throw new ConflictException('Duplicated Nickname');
    }

    const updatedUser = await this.prismaService.accountTb.update({
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },
      //prettier-ignore
      data: {
        nickname: dto.nickname ?? user.nickname,
        profile: dto.profile ?? user.profile,
        interest1: (dto.interest?.[0] ?? user.interest1),
        interest2: (dto.interest?.[1] ?? user.interest2),
      },
      where: {
        idx: userIdx,
      },
    });

    return new UserEntity(updatedUser);
  }

  async updateMyProfileImg(userIdx: string, imgPath: string): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          accountIdx: userIdx,
        },
      }),

      this.prismaService.profileImgTb.create({
        data: {
          accountIdx: userIdx,
          imgPath: imgPath,
        },
      }),
    ]);
  }

  async deleteMyProfileImg(userIdx: string): Promise<void> {
    await this.prismaService.profileImgTb.updateMany({
      data: {
        deletedAt: new Date(),
      },
      where: {
        accountIdx: userIdx,
      },
    });
  }

  async deleteUser(userIdx: string): Promise<void> {
    await this.prismaService.accountTb.update({
      where: {
        idx: userIdx,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
