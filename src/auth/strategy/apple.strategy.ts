import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { ConfigService } from '@nestjs/config';

export class AppleStrategy implements ISocialAuthStrategy {
  constructor(private readonly configService: ConfigService) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://accounts.google.com/o/oauth2/v2/auth`;

    res.redirect(url);
  }

  async socialAuthCallback(query: any): Promise<{ accessToken: string }> {
    throw new Error('Method not implemented.');
  }
}
