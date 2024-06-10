import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateMyInfoDto {
  @ApiProperty({ description: '2-10자 닉네임' })
  @IsString()
  @Length(2, 10)
  nickname: string;

  @ApiProperty({ description: '1-200자 프로필' })
  @IsString()
  @Length(1, 200)
  profile: string;
}
