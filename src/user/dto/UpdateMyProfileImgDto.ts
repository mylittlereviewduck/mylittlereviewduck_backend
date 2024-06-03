import { ApiProduces, ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateMyProfileImgDto {
  @ApiProperty()
  @IsString()
  profileImg: string;
}
