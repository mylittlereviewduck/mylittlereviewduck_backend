import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsOptional, IsString, Length } from 'class-validator';

export class UpdateMyInfoDto {
  @ApiProperty({ description: '2-10자 닉네임' })
  @IsString()
  @Length(2, 10)
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '1-200자 프로필' })
  @IsString()
  @Length(1, 200)
  @IsOptional()
  profile?: string;

  @ApiProperty({ description: '유저 관심사' })
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @IsOptional()
  interest?: string[];
}
