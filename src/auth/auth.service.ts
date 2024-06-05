import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async SignInOAuth(req, res) {
    console.log('req.query~~~~~~~~~~~');
    console.log(req.query);

    console.log('req.users~~~~~~~~~');
    console.log(req.user);

    const { email } = req.user;
    //해당 이메일로 가입한 유저 찾기

    const user = await this.userService.getUserByEmail(email);

    console.log(req.user);
    console.log(typeof req.user.providerKey);

    //유저 없다면 회원가입
    if (!user) {
      console.log('유저없음');
      const user = await this.prismaService.account_tb.create({
        data: {
          email: req.user.email,
          provider: req.user.provider,
          providerKey: req.user.providerKey,
        },
      });
      console.log(user);
    }

    const payload = { idx: user.idx };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };

    //유저 있다면 액세스토큰, 리프레시 토큰 전송
  }
}
