import { ApiProperty } from '@nestjs/swagger';

export class AppleOauthDto {
  @ApiProperty({
    example: 'authorizationCode',
    description: 'OAuth Authortization Code',
  })
  authorizationCode: string;
}
