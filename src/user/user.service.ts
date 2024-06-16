import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpOAuthDto } from './dto/SignUpOAuth.dto';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateMyInfoDto } from './dto/UpdateMyInfo.dto';
import { UpdateMyProfileImgDto } from './dto/UpdateMyProfileImg.dto';
import { GetUserDto } from './dto/GetUserByEmail.dto';
import { UserWithProvider } from './model/user-with-provider.model';
import { LoginUser } from 'src/auth/model/login-user.model';
import { AccountTb, ProfileImgTb } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUser(getUserDto: GetUserDto): Promise<UserEntity | null> {
    const user = await this.prismaService.accountTb.findUnique({
      where: {
        idx: getUserDto.idx,
        email: getUserDto.email,
        nickname: getUserDto.nickname,
      },
      include: {
        profileImgTb: true,
      },
    });

    if (!user) {
      return;
    }

    return new UserEntity(user);
  }

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    //트랜잭션 적용추가
    const emailDuplicatedUser = await this.getUser({
      email: createUserDto.email,
    });

    if (emailDuplicatedUser) {
      throw new ConflictException('Email Duplicated');
    }

    const verifiedEmail = await this.prismaService.verifiedEmailTb.findUnique({
      where: { email: createUserDto.email, isVerified: true },
    });

    if (!verifiedEmail) {
      throw new ConflictException('Not Verified Email');
    }

    await this.prismaService.verifiedEmailTb.delete({
      where: { idx: verifiedEmail.idx },
    });

    await this.prismaService.accountTb.create({
      data: { email: createUserDto.email, pw: createUserDto.pw },
    });
  }

  async createUserWithOAuth(
    signUpOAuthDto: SignUpOAuthDto,
  ): Promise<UserEntity> {
    let userData: AccountTb, profileImgData: ProfileImgTb;

    await this.prismaService.$transaction(async (tx) => {
      const userData = await tx.accountTb.create({
        data: {
          email: signUpOAuthDto.email,
          provider: signUpOAuthDto.provider,
          providerKey: signUpOAuthDto.providerKey,
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

    return new UserEntity(userEntityData);
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

  async updateMyProfileImg(
    loginUser: LoginUser,
    updateMyProfileImgDto: UpdateMyProfileImgDto,
  ): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          idx: loginUser.idx,
        },
      }),

      this.prismaService.profileImgTb.create({
        data: {
          accountIdx: loginUser.idx,
          imgPath: updateMyProfileImgDto.profileImg,
        },
      }),
    ]);
  }

  async deleteMyProfileImg(loginUser: LoginUser): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.profileImgTb.update({
        data: {
          deletedAt: new Date(),
        },
        where: {
          idx: loginUser.idx,
        },
      }),

      this.prismaService.profileImgTb.create({
        data: {
          accountIdx: loginUser.idx,
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
