import { Request, Response } from 'express';

export interface ISocialAuthStrategy {
  getTokenRequest(req: Request, res: Response): Promise<void>;

  socialLogin(query: any): Promise<{ accessToken: string }>;
}
