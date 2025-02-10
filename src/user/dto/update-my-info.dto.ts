import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsOptional, IsString, Length } from 'class-validator';

export class UpdateMyInfoDto {
  @ApiProperty({ description: '2-16자 닉네임', required: false })
  @IsString()
  @Length(2, 16)
  @IsOptional()
  nickname?: string;

  @ApiProperty({ description: '0-200자 프로필', required: false })
  @IsString()
  @Length(0, 200)
  @IsOptional()
  profile?: string;

  @ApiProperty({ description: '유저 관심사', required: false })
  @IsString({ each: true })
  @ArrayMaxSize(2)
  @Length(0, 16, { each: true })
  @IsOptional()
  interest?: string[];
}
