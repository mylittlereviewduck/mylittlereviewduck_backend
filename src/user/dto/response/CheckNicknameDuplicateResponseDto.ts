import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class CheckNicknameDuplicateResponseDto {
  @ApiProperty({ description: '중복여부 true/false로 반환' })
  @IsBoolean()
  isDuplicated: boolean;
}
