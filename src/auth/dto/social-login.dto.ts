import { ApiProperty } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({ example: 'code', description: 'OAuth 인증코드' })
  code: string;
}
