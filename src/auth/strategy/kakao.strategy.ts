import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { SocialAuthDto } from '../dto/social-auth.dto';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { SocialLoginProvider } from '../model/social-login-provider.model';

export class KakaoStrategy implements ISocialAuthStrategy {
  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://accounts.google.com/o/oauth2/v2/auth`;

    res.redirect(url);
  }
  async socialLogin(query: any): Promise<{ accessToken: string }> {
    throw new Error('Method not implemented.');
  }
}
