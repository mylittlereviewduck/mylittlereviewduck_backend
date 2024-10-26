import { EmailAuthService } from './../auth/email-auth.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateUserOAtuhDto } from './dto/create-user-oauth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UserWithProvider } from './model/user-with-provider.model';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';
import { UserFollowPagerbleDto } from './dto/user-follow-pagerble.dto';
import { EmailService } from '../email/email.service';
import { GetUsersAllDto } from './dto/get-users-all.dto';
import { Prisma } from '@prisma/client';
import { UserListResponseDto } from './dto/response/user-list-response.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly emailAuthService: EmailAuthService,
  ) {}

  async getUser(getUserDto: GetUserDto): Promise<UserEntity | undefined> {
    const userData = await this.prismaService.accountTb.findFirst({
      include: {
        profileImgTb: true,
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },
      where: {
        idx: getUserDto.idx,
        email: getUserDto.email,
        nickname: getUserDto.nickname,
        deletedAt: null,
      },
    });

    if (!userData) {
      return undefined;
    }

    return new UserEntity(userData);
  }

  async getUsersAll(dto: GetUsersAllDto): Promise<UserListResponseDto> {
    console.log('dto', dto);

    const Count = await this.prismaService.accountTb.count({
      where: {
        deletedAt: null,
        suspendExpireAt: null, // active 상태만 확인
      },
    });

    console.log('Count: ', Count);

    //or문이 빈배열이라면 쿼리에서 완전히 지워야한다.
    //
    //prettier-ignore
    const totalCount = await this.prismaService.accountTb.count({
      where: {
        deletedAt: null,
        ...(dto.status === 'active' ? { suspendExpireAt: null } : {}),
        ...(dto.status === 'suspended' ? { suspendExpireAt: { not: null } } : {}),
        ...(dto.status === 'blackList' ? { suspendExpireAt: { gte: new Date('2100-01-01') } } : {}),
        ...(dto.email || dto.nickname || dto.interest1 || dto.interest2
          ? {
              OR: [
                dto.email ? { email: { contains: dto.email, mode: Prisma.QueryMode.insensitive } } : null,
                dto.nickname ? { nickname: { contains: dto.nickname, mode: Prisma.QueryMode.insensitive } } : null,
                dto.interest1 ? { interest1: { contains: dto.interest1, mode: Prisma.QueryMode.insensitive } } : null,
                dto.interest2 ? { interest2: { contains: dto.interest2, mode: Prisma.QueryMode.insensitive } } : null,
              ].filter((x) => x !== null),// null 값 제거
            }
          : {}),
      },
    });

    const userData = await this.prismaService.accountTb.findMany({
      include: {
        profileImgTb: true,
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
        ...(dto.status === 'active' ? { suspendExpireAt: null } : {}),
        ...(dto.status === 'suspended' ? { suspendExpireAt: { not: null } } : {}),
        ...(dto.status === 'blackList' ? { suspendExpireAt: { gte: new Date('2100-01-01') } } : {}),
        ...(dto.email || dto.nickname || dto.interest1 || dto.interest2
          ? {
              OR: [
                dto.email ? { email: { contains: dto.email, mode: Prisma.QueryMode.insensitive } } : null,
                dto.nickname ? { nickname: { contains: dto.nickname, mode: Prisma.QueryMode.insensitive } } : null,
                dto.interest1 ? { interest1: { contains: dto.interest1, mode: Prisma.QueryMode.insensitive } } : null,
                dto.interest2 ? { interest2: { contains: dto.interest2, mode: Prisma.QueryMode.insensitive } } : null,
              ].filter((x) => x !== null),// null 값 제거
            }
          : {}),
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

  //이메일인증 확인 로직추가
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    let newUser;
    await this.prismaService.$transaction(async (tx) => {
      const emailDuplicatedUser = await this.getUser({ email: dto.email });

      if (emailDuplicatedUser) {
        throw new ConflictException('Email Duplicated');
      }

      const authenticatedEmail =
        await this.emailAuthService.getEmailWithVerificationCode(dto.email);

      if (!authenticatedEmail || authenticatedEmail.isVerified !== true) {
        throw new UnauthorizedException('Unauthorized Email');
      }

      if (
        new Date().getTime() - authenticatedEmail.createdAt.getTime() >
        30 * 60 * 1000
      ) {
        throw new UnauthorizedException('Authentication TimeOut');
      }

      newUser = await tx.accountTb.create({
        data: {
          email: dto.email,
          pw: dto.pw,
          provider: 'local',
        },
      });

      newUser = await tx.accountTb.update({
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

  async createUserWithOAuth(dto: CreateUserOAtuhDto): Promise<UserEntity> {
    let userData;

    userData = await this.prismaService.accountTb.create({
      data: {
        email: dto.email,
        nickname: dto.nickname,
        provider: dto.provider,
        providerKey: dto.providerKey,

        profileImgTb: {
          create: {},
        },
      },
      include: {
        profileImgTb: true,
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

    if (duplicatedUser && user.nickname != duplicatedUser.nickname) {
      throw new ConflictException('Duplicated Nickname');
    }

    const updatedUser = await this.prismaService.accountTb.update({
      include: {
        profileImgTb: true,
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },
      data: {
        nickname: dto.nickname,
        profile: dto.profile,
        interest1: dto.interest[0],
        interest2: dto.interest[1],
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
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          accountIdx: userIdx,
        },
      }),
    ]);
  }

  async getUserWithProvider(
    userIdx: string,
    provider: string,
  ): Promise<UserWithProvider> {
    const userData = await this.prismaService.accountInfoView.findUnique({
      where: {
        idx: userIdx,
        provider: provider,
      },
    });

    if (!userData) {
      throw new NotFoundException('Not Found User');
    }

    return new UserWithProvider(userData);
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

  async getFollowingList(
    dto: UserFollowPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const getFollowingCount = await this.prismaService.followTb.count({
      where: {
        followerIdx: dto.userIdx,
      },
    });

    const followList = await this.prismaService.accountTb.findMany({
      include: {
        profileImgTb: true,
        _count: {
          select: {
            followee: true,
            follower: true,
          },
        },
      },

      where: {
        [dto.type === 'follower' ? 'followee' : 'follower']: {
          some: {
            [dto.type === 'follower' ? 'followerIdx' : 'followeeIdx']:
              dto.userIdx,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },

      skip: (dto.page - 1) * dto.size,
      take: dto.size,
    });

    return {
      totalPage: Math.ceil(getFollowingCount / dto.size),
      users: followList.map((elem) => new UserEntity(elem)),
    };
  }
}
