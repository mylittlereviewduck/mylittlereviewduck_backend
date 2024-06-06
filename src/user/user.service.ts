import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/UserEntity';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpOAuthDto } from './dto/SignUpOAuthDto';
import { SignUpDto } from './dto/SignUpDto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByidx() {}

  async getUserByNickname() {}

  async getUserByEmail(email: string): Promise<UserEntity> {
    const user = await this.prismaService.account_tb.findUnique({
      where: { email: email },
      include: { profile_img_tb: true },
    });

    if (!user) {
      return;
    }

    return new UserEntity(user);
  }

  async signUp(signUpDto: SignUpDto) {
    // await this.prismaService.account_tb.create({
    //   data: { email: signUpDto.email, provider:  },
    // });
  }

  async signUpOAuth(signUpOAuthDto: SignUpOAuthDto): Promise<UserEntity> {
    const userData = await this.prismaService.account_tb.create({
      data: {
        email: signUpOAuthDto.email,
        provider: signUpOAuthDto.provider,
        providerKey: signUpOAuthDto.providerKey,
      },
    });

    const profileImgData = await this.prismaService.profile_img_tb.create({
      data: {
        accountIdx: userData.idx,
      },
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

  async getMyinfo() {}

  async updateMyinfo() {}

  async updateMyProfileImg() {}

  async deleteMyProfileImg() {}
}
