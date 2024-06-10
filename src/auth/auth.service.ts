import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entity/User.entity';
import { profile } from 'console';
import { SignInDto } from './dto/SignIn.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const userData = await this.prismaService.accountTb.findUnique({
      where: { email: signInDto.email, pw: signInDto.pw },
    });

    const accessToken = await this.jwtService.signAsync({});

    return;
  }

  async signInOAuth(req, res): Promise<string> {
    const { email } = req.user;

    let user = await this.userService.getUserByEmail(email);

    if (!user) {
      user = await this.userService.signUpOAuth({
        email: req.user.email,
        provider: req.user.provider,
        providerKey: req.user.providerKey,
      });
    }

    const payload = { idx: user.idx };
    return await this.jwtService.signAsync(payload);
  }
}
