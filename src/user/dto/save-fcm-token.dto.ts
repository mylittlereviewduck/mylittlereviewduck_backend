import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateFcmTokenDto {
  @ApiProperty({ description: 'fcm토큰' })
  @IsString()
  token: string;

  @ApiProperty({ description: '디바이스 식별자' })
  @IsString()
  deviceIdx: string;
}
