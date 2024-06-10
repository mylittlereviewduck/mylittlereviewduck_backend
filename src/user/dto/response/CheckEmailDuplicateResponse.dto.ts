import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDuplicateReponseDto {
  @ApiProperty({ description: '중복여부 true/false로 반환' })
  isDuplicated: boolean;
}
