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
import { AccountTb, ProfileImgTb } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(getUserDto: GetUserDto): Promise<UserEntity | undefined> {
    const user = await this.prismaService.accountDetailView.findFirst({
      where: {
        idx: getUserDto.idx,
        email: getUserDto.email,
        nickname: getUserDto.nickname,
      },
    });

    if (!user) {
      return;
    }

    return new UserEntity({
      ...user,
      profileImg: user.profileImg,
      followingCount: user.followerCount,
      followerCount: user.followeeCount,
      reportCount: user.accountReportedCount,
    });
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

      newProfileImg = await tx.profileImgTb.create({
        data: {
          accountIdx: newUser.idx,
        },
      });
    });

    const userData = {
      ...newUser,
      profileImg: newProfileImg.imgPath,
      followingCount: 0,
      followerCount: 0,
      reportCount: 0,
    };

    return new UserEntity(userData);
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
      ...userData,
      profileImg: profileImgData.imgPath,
      followingCount: 0,
      followerCount: 0,
      reportCount: 0,
    };

    return new UserEntity(userEntityData);
  }

  async updateMyinfo(
    userIdx: string,
    updateMyInfoDto: UpdateMyInfoDto,
  ): Promise<void> {
    const user = await this.getUser({
      idx: userIdx,
    });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    const duplicatedUser = await this.getUser({
      nickname: updateMyInfoDto.nickname,
    });

    if (duplicatedUser) {
      throw new ConflictException('Duplicated Nickname');
    }

    const updatedUser = await this.prismaService.accountTb.update({
      data: {
        nickname: updateMyInfoDto.nickname,
        profile: updateMyInfoDto.profile,
      },
      where: {
        idx: userIdx,
      },
    });

    console.log(updatedUser);

    return;
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
}
