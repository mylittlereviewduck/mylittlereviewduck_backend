import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class AppleOauthDto {
  @ApiProperty({
    example: 'authorizationCode--',
    description: 'apple Authortization Code를 주셔야합니다.',
  })
  authorizationCode: string;

  @ApiProperty({
    example: 'app',
    description: "요청 플랫폼에 따라 'app' 또는 'web'으로 주셔야합니다.",
  })
  @IsString()
  @IsEnum(['web', 'app'])
  platform: 'web' | 'app';
}
