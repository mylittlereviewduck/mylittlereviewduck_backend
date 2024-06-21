import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginResponseDto {
  @ApiProperty()
  @IsString()
  accessToken: string;
}
