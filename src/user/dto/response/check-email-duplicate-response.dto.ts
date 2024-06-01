import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDuplicateReponseDto {
  @ApiProperty()
  message: string;
}
