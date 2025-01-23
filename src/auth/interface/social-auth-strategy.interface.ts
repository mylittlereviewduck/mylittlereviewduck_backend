import { Request, Response } from 'express';
import { LoginResponseDto } from '../dto/response/login-response.dto';

export interface ISocialAuthStrategy {
  getTokenRequest(req: Request, res: Response): Promise<void>;

  socialLogin(query: any): Promise<LoginResponseDto>;

  socialAuth(code: string): Promise<LoginResponseDto>;
}
