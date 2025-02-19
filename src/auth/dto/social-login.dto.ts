import { ApiProperty } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({ example: 'access token', description: 'OAuth Access Token' })
  token: string;
}
