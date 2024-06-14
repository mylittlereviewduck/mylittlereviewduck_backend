import { IsEnum } from 'class-validator';
import { SocialLoginProvider } from '../model/social-login-provider.model';

export class SocialAuthDto {
  providerKey: string;

  email: string;

  // @IsEnum(SocialLoginProvider)
  provider: SocialLoginProvider;
}
