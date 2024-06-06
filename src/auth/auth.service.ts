import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/entity/UserEntity';
import { profile } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async SignInOAuth(req, res) {
    console.log(req.user);
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
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken: accessToken,
    };
  }
}
