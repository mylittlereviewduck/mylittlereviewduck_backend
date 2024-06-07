import { ConflictException, Injectable } from '@nestjs/common';
import { UserEntity } from './entity/UserEntity';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpOAuthDto } from './dto/SignUpOAuthDto';
import { SignUpDto } from './dto/SignUpDto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByidx(userIdx: number): Promise<UserEntity | null> {
    const user = await this.prismaService.accountTb.findUnique({
      where: { idx: userIdx },
      include: { profileImgTb: true },
    });

    if (!user) {
      return;
    }

    return new UserEntity(user);
  }

  async getUserByNickname(nickname: string): Promise<UserEntity | null> {
    const user = await this.prismaService.accountTb.findUnique({
      where: { nickname: nickname },
      include: { profileImgTb: true },
    });

    if (!user) {
      return;
    }

    return new UserEntity(user);
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.accountTb.findUnique({
      where: { email: email },
      include: { profileImgTb: true },
    });

    if (!user) {
      return;
    }

    return new UserEntity(user);
  }

  async signUp(signUpDto: SignUpDto): Promise<void> {
    //트랜잭션 적용추가
    const emailDuplicatedUser = await this.getUserByEmail(signUpDto.email);

    if (emailDuplicatedUser) {
      throw new ConflictException('Email Duplicated');
    }

    const verifiedEmail = await this.prismaService.verifiedEmailTb.findUnique({
      where: { email: signUpDto.email, isVerified: true },
    });

    if (!verifiedEmail) {
      throw new ConflictException('Not Verified Email');
    }

    await this.prismaService.verifiedEmailTb.delete({
      where: { idx: verifiedEmail.idx },
    });

    await this.prismaService.accountTb.create({
      data: { email: signUpDto.email, pw: signUpDto.pw },
    });
  }

  async signUpOAuth(signUpOAuthDto: SignUpOAuthDto): Promise<UserEntity> {
    const userData = await this.prismaService.accountTb.create({
      data: {
        email: signUpOAuthDto.email,
        provider: signUpOAuthDto.provider,
        providerKey: signUpOAuthDto.providerKey,
      },
    });

    const profileImgData = await this.prismaService.profileImgTb.create({
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
