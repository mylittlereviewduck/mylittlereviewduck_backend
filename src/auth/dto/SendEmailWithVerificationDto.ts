import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class SendEmailWithVerificationDto {
  @ApiProperty()
  @IsInt()
  code: number;
}
