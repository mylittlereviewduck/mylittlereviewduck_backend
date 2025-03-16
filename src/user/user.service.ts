import { EmailAuthService } from './../auth/email-auth.service';
import {
  BadRequestException,
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
import { AccountTb, Prisma, PrismaClient } from '@prisma/client';
import { BcryptService } from 'src/auth/bcrypt.service';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';
import { GetUserSearchDto } from './dto/get-users-search.dto';
import { UserInteractionService } from './user-interaction.service';
import { LoginUser } from 'src/auth/model/login-user.model';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    @Inject(forwardRef(() => EmailAuthService))
    private readonly emailAuthService: EmailAuthService,
    private readonly userInteractionService: UserInteractionService,
    private readonly eventEmitter: EventEmitter2,
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
        _count: {
          select: {
            followings: true,
            followers: true,
            reviewTb: true,
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

  async getUsersAll(dto: GetUsersAllDto): Promise<UserPagerbleResponseDto> {
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
        },  
        orderBy:{
          createdAt: 'desc'
        },
        
    });

    const userData = await this.prismaService.accountTb.findMany({
      include: {
        _count: {
          select: {
            followings: true,
            followers: true,
            reviewTb: true,
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
        _count: {
          select: {
            followings: true,
            followers: true,
            reviewTb: true,
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

  async getSearchedUsersWithInteraction(
    dto: GetUserSearchDto,
    loginUser: LoginUser | null,
  ): Promise<UserPagerbleResponseDto> {
    const userSearchResponseDto = await this.getUsersAll({
      email: dto.search,
      nickname: dto.search,
      interest1: dto.search,
      interest2: dto.search,
      size: dto.size,
      page: dto.page,
    });
    if (!loginUser) {
      return userSearchResponseDto;
    }

    this.eventEmitter.emit('search.user', dto.search, loginUser.idx);

    if (userSearchResponseDto.users.length === 0)
      return { totalPage: 0, users: [] };

    const userIdxs = userSearchResponseDto.users.map((user) => user.idx);

    const userInteraction =
      await this.userInteractionService.getUserInteraction(
        loginUser.idx,
        userIdxs,
      );

    const interactionMap = new Map(
      userInteraction.map((interaction) => [
        interaction.accountIdx,
        interaction,
      ]),
    );

    userSearchResponseDto.users.map((user) => {
      const interaction = interactionMap.get(user.idx);
      if (interaction) {
        user.isMyFollowing = interaction.isMyFollowing;
        user.isMyBlock = interaction.isMyBlock;
      }
    });

    return userSearchResponseDto;
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    let newUser: AccountTb;

    await this.prismaService.$transaction(async (tx) => {
      const emailDuplicatedUser = await this.getUser({ email: dto.email }, tx);

      if (emailDuplicatedUser) {
        throw new ConflictException('Email Duplicated');
      }

      const authenticatedEmail =
        await this.emailAuthService.getEmailVerification(
          dto.email,
          undefined,
          tx,
        );

      if (!authenticatedEmail || authenticatedEmail.verifiedAt === null) {
        throw new UnauthorizedException('Unauthorized Email');
      }

      if (
        new Date().getTime() - authenticatedEmail.verifiedAt.getTime() >
        15 * 60 * 1000
      ) {
        throw new UnauthorizedException('Authentication TimeOut');
      }

      const hashedPw = await this.bcryptService.hash(dto.pw);

      newUser = await tx.accountTb.create({
        data: {
          email: dto.email,
          pw: hashedPw,
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

    await this.emailAuthService.deleteEmailVerification(dto.email);

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
        _count: {
          select: {
            followings: true,
            followers: true,
            reviewTb: true,
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
    if (!dto.interest && !dto.interest && !dto.profile)
      throw new BadRequestException('minimum 1 property');

    if (dto.nickname && dto.nickname.includes('번째 오리'))
      throw new BadRequestException(
        "'번째 오리'는 닉네임에 사용할 수 없습니다.",
      );

    const updatedUser = await this.prismaService.$transaction(async (tx) => {
      const user = await this.getUser(
        {
          idx: userIdx,
        },
        tx,
      );

      if (!user) {
        throw new NotFoundException('Not Found User');
      }

      let duplicatedUser;
      if (dto.nickname) {
        duplicatedUser = await this.getUser(
          {
            nickname: dto.nickname,
          },
          tx,
        );
      }

      if (duplicatedUser && duplicatedUser.nickname == dto.nickname) {
        throw new ConflictException('Duplicated Nickname');
      }

      const updatedUser = await tx.accountTb.update({
        include: {
          _count: {
            select: {
              followings: true,
              followers: true,
              reviewTb: true,
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

      return updatedUser;
    });
    return new UserEntity(updatedUser);
  }

  async updateMyProfileImg(
    userIdx: string,
    imgPath: string | null,
    tx?: PrismaClient,
  ): Promise<void> {
    const prismaService = tx ?? this.prismaService;

    await prismaService.accountTb.update({
      where: {
        idx: userIdx,
      },
      data: {
        profileImg: imgPath,
      },
    });
  }

  async updatePassword(email: string, pw: string): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      //인증된 이메일인지 확인
      const emailVerification =
        await this.emailAuthService.getEmailVerification(email, undefined, tx);

      if (!emailVerification || emailVerification.verifiedAt === null) {
        throw new UnauthorizedException('Unauthorized Email');
      }

      if (
        Date.now() - emailVerification.verifiedAt.getTime() >=
        6 * 60 * 1000
      ) {
        throw new UnauthorizedException('Email Verification TimeOut');
      }

      //비밀번호 암호화
      const hashedPw = await this.bcryptService.hash(pw);

      //비밀번호 저장
      await tx.accountTb.updateMany({
        data: {
          pw: hashedPw,
        },
        where: {
          email: email,
        },
      });

      await this.emailAuthService.deleteEmailVerification(email, tx);
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
