import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty()
  @IsString()
  accessToken: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;

  @ApiProperty()
  @IsString()
  nickname: string;
}
