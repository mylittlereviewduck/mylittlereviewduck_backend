import { ApiProperty } from '@nestjs/swagger';

export class EmailVerifyResponseDto {
  @ApiProperty()
  isVerified: boolean;
}
