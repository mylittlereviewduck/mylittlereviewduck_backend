import { SignInDto } from '../auth/dto/signIn.dto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpOAuthDto } from './dto/SignUpOAuth.dto';
import { SignUpDto } from './dto/SignUp.dto';
import { UpdateMyInfoDto } from './dto/UpdateMyInfo.dto';
import { UpdateMyProfileImgDto } from './dto/UpdateMyProfileImg.dto';
import { GetUserDto } from './dto/GetUserByEmail.dto';

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

  signUp: (signUpDto: SignUpDto) => Promise<void> = async (signUpDto) => {
    //트랜잭션 적용추가
    const emailDuplicatedUser = await this.getUser({ email: signUpDto.email });

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
  };

  signUpOAuth: (signUpOAuthDto: SignUpOAuthDto) => Promise<UserEntity> = async (
    signUpOAuthDto,
  ) => {
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
  };

  // getMyinfo: () {}

  updateMyinfo: (updateMyInfoDto: UpdateMyInfoDto) => Promise<void> = async (
    updateMyInfoDto,
  ) => {};

  updateMyProfileImg: (
    updateMyProfileImgDto: UpdateMyProfileImgDto,
  ) => Promise<void> = async (updateMyProfileImgDto) => {};

  deleteMyProfileImg: (userIdx: number) => Promise<void> = async (
    userIdx,
  ) => {};
}
