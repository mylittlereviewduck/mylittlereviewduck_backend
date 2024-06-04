import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsInt()
  code: number;
}
