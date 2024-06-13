import { Request } from 'express';
import { SocialAuthDto } from '../dto/social-auth.dto';
import { SocialWithdrawDto } from '../dto/social-withdraw.dto';

export interface ISocialAuthStrategy {
  socialAuth(
    req: Request,
    social: string,
    socialAuthDto: SocialAuthDto,
  ): Promise<{ accessToken: string }>;

  socialWithdraw(
    accessToken: string,
    socialWithdrawDto: SocialWithdrawDto,
  ): Promise<void>;
}
