import { Request, Response } from 'express';
import { SocialAuthDto } from '../dto/social-auth.dto';
import { SocialWithdrawDto } from '../dto/social-withdraw.dto';
import { SocialLoginProvider } from '../model/social-login-provider.model';
import { LoginUser } from '../model/login-user.model';

export interface ISocialAuthStrategy {
  getTokenRequest(
    req: Request,
    res: Response,
    provider: SocialLoginProvider,
    socialAuthDto: SocialAuthDto,
  ): Promise<void>;

  socialAuthCallback(query: any): Promise<{ accessToken: string }>;
}
