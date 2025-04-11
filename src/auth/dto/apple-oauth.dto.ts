import { ApiProperty } from '@nestjs/swagger';

export class AppleOauthDto {
  @ApiProperty({
    example: 'authortizationCode',
    description: 'OAuth Authortization Code',
  })
  authortizationCode: string;
}
