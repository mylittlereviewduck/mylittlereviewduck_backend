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
    const user = await this.prismaService.account_tb.findMany({
      where: { email: email },
    });

    console.log('thisis user');
    console.log(user);

    return new UserEntity(user);
  }

  async signUp(signUpDto: SignUpDto) {
    // await this.prismaService.account_tb.create({
    //   data: { email: signUpDto.email, provider:  },
    // });
  }

  async signUpOAuth(signUpOAuthDto: SignUpOAuthDto) {
    await this.prismaService.account_tb.create({
      data: {
        email: signUpOAuthDto.email,
        provider: signUpOAuthDto.provider,
        provider_key: signUpOAuthDto.providerKey,
      },
    });
  }

  async getMyinfo() {}

  async updateMyinfo() {}

  async updateMyProfileImg() {}

  async deleteMyProfileImg() {}
}
