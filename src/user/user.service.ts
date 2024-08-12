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
import { UpdateMyProfileImgDto } from './dto/update-my-profile-img.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UserWithProvider } from './model/user-with-provider.model';
import { LoginUser } from 'src/auth/model/login-user.model';
import { AccountTb, ProfileImgTb } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(getUserDto: GetUserDto): Promise<UserEntity | undefined> {
    const user = await this.prismaService.accountTb.findFirst({
      where: {
        idx: getUserDto.idx,
        email: getUserDto.email,
        nickname: getUserDto.nickname,
      },
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
        _count: {
          select: {
            follower: true,
            followee: true,
            reviewReportTb: true,
          },
        },
      },
    });

    if (!user) {
      return;
    }

    return new UserEntity({
      ...user,
      profileImg: user.profileImgTb[0].imgPath,
      followingCount: user._count.follower,
      followerCount: user._count.followee,
      reportCount: user._count.reviewReportTb,
    });
  }

  // 유저생성
  // 인증된이메일인지 확인
  // 이메일 중복인지확인
  // 유저추가
  //이메일인증 확인 로직추가
  async createUser(createUserDto: CreateUserDto): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const emailDuplicatedUser = await tx.accountTb.findFirst({
        where: {
          email: createUserDto.email,
        },
      });

      if (emailDuplicatedUser) {
        throw new ConflictException('Email Duplicated');
      }

      await tx.accountTb.create({
        data: { email: createUserDto.email, pw: createUserDto.pw },
      });
    });
  }

  async createUserWithOAuth(
    createUserOAuthDto: CreateUserOAtuhDto,
  ): Promise<UserEntity> {
    let userData: AccountTb, profileImgData: ProfileImgTb;

    await this.prismaService.$transaction(async (tx) => {
      userData = await tx.accountTb.create({
        data: {
          email: createUserOAuthDto.email,
          nickname: createUserOAuthDto.nickname,
          provider: createUserOAuthDto.provider,
          providerKey: createUserOAuthDto.providerKey,
        },
      });

      profileImgData = await tx.profileImgTb.create({
        data: {
          accountIdx: userData.idx,
        },
      });
    });

    const userEntityData = {
      idx: userData.idx,
      email: userData.email,
      profile: userData.profile,
      profileImg: profileImgData.imgPath,
      nickname: userData.nickname,
    };

    return;
    // return new UserEntity(userEntityData);
  }

  async updateMyinfo(
    loginUser: LoginUser,
    updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<void> {
    const duplicatedNickname = await this.getUser({
      nickname: updateMyInfoDto.nickname,
    });

    if (duplicatedNickname) {
      throw new ConflictException('Duplicated Nickname');
    }

    await this.prismaService.accountTb.update({
      data: {
        nickname: updateMyInfoDto.nickname,
        profile: updateMyInfoDto.profile,
      },
      where: {
        idx: loginUser.idx,
      },
    });
  }

  async updateMyProfileImg(accountIdx: number, imgPath: string): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          accountIdx: accountIdx,
        },
      }),

      this.prismaService.profileImgTb.create({
        data: {
          accountIdx: accountIdx,
          imgPath: imgPath,
        },
      }),
    ]);
  }

  async deleteMyProfileImg(accountIdx: number): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.updateMany({
        data: {
          deletedAt: new Date(),
        },
        where: {
          accountIdx: accountIdx,
        },
      }),

      this.prismaService.profileImgTb.create({
        data: {
          accountIdx: accountIdx,
        },
      }),
    ]);
  }

  async getUserWithProvider(
    userIdx: number,
    provider: string,
  ): Promise<UserWithProvider> {
    const userData = await this.prismaService.accountTb.findUnique({
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

  async deleteUser(userIdx: number): Promise<void> {
    await this.prismaService.accountTb.update({
      where: { idx: userIdx },
      data: { deletedAt: new Date() },
    });
  }
}
