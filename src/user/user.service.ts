import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CreateUserOAtuhDto } from './dto/create-user-oauth.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UserWithProvider } from './model/user-with-provider.model';
import { UserSearchPagerbleDto } from './dto/user-search-pagerble.dto';
import { UserSearchResponseDto } from './dto/response/user-search-response.dto';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';
import { UserFollowPagerbleDto } from './dto/user-follow-pagerble.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

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
      },
    });

    if (!userData) {
      return undefined;
    }

    return new UserEntity(userData);
  }

  async getUserWithSearch(
    userSearchPagerbleDto: UserSearchPagerbleDto,
  ): Promise<UserSearchResponseDto> {
    const totalCount = await this.prismaService.accountTb.count({
      where: {
        OR: [
          {
            nickname: {
              contains: userSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            interest1: {
              contains: userSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            interest2: {
              contains: userSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
        ],
        deletedAt: null,
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
      where: {
        OR: [
          {
            nickname: {
              contains: userSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            interest1: {
              contains: userSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
          {
            interest2: {
              contains: userSearchPagerbleDto.search,
              mode: 'insensitive',
            },
          },
        ],
        deletedAt: null,
      },

      orderBy: {
        idx: 'desc',
      },
      skip: userSearchPagerbleDto.size * (userSearchPagerbleDto.page - 1),
      take: userSearchPagerbleDto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / userSearchPagerbleDto.size),
      users: userData.map((elem) => new UserEntity(elem)),
    };
  }

  //이메일인증 확인 로직추가
  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    let newUser;
    let newProfileImg;
    await this.prismaService.$transaction(async (tx) => {
      const emailDuplicatedUser = await tx.accountInfoView.findFirst({
        where: {
          email: createUserDto.email,
        },
      });

      if (emailDuplicatedUser) {
        throw new ConflictException('Email Duplicated');
      }

      newUser = await tx.accountTb.create({
        data: {
          email: createUserDto.email,
          pw: createUserDto.pw,
          provider: 'local',
          profileImgTb: {
            create: {},
          },
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

    return new UserEntity(newUser);
  }

  async createUserWithOAuth(
    createUserOAuthDto: CreateUserOAtuhDto,
  ): Promise<UserEntity> {
    let userData;

    userData = await this.prismaService.accountTb.create({
      data: {
        email: createUserOAuthDto.email,
        nickname: createUserOAuthDto.nickname,
        provider: createUserOAuthDto.provider,
        providerKey: createUserOAuthDto.providerKey,

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
    updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<UserEntity> {
    const user = await this.getUser({
      idx: userIdx,
    });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const duplicatedUser = await this.getUser({
      nickname: updateMyInfoDto.nickname,
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
        nickname: updateMyInfoDto.nickname,
        profile: updateMyInfoDto.profile,
        interest1: updateMyInfoDto.interest[0],
        interest2: updateMyInfoDto.interest[1],
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

      this.prismaService.profileImgTb.create({
        data: {
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
    userPagerbleDto: UserFollowPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const getFollowingCount = await this.prismaService.followTb.count({
      where: {
        followerIdx: userPagerbleDto.userIdx,
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
        [userPagerbleDto.type === 'follower' ? 'followee' : 'follower']: {
          some: {
            [userPagerbleDto.type === 'follower'
              ? 'followerIdx'
              : 'followeeIdx']: userPagerbleDto.userIdx,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },

      skip: (userPagerbleDto.page - 1) * userPagerbleDto.size,
      take: userPagerbleDto.size,
    });

    return {
      totalPage: Math.ceil(getFollowingCount / userPagerbleDto.size),
      users: followList.map((elem) => new UserEntity(elem)),
    };
  }
}
