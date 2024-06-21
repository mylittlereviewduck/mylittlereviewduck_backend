import { Request, Response } from 'express';
import { SocialAuthDto } from '../dto/social-auth.dto';
import { SocialLoginProvider } from '../model/social-login-provider.model';

export interface ISocialAuthStrategy {
  getTokenRequest(req: Request, res: Response): Promise<void>;

  socialAuthCallback(query: any): Promise<{ accessToken: string }>;
}
