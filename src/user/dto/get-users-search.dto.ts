import { ApiProperty } from '@nestjs/swagger';
import { UserPagerbleDto } from './user-pagerble.dto';
import { IsString, Length } from 'class-validator';

export class GetUserSearchDto extends UserPagerbleDto {
  @ApiProperty({
    description: '검색키워드',
  })
  @IsString()
  @Length(2, 100, { message: '검색 글자수 제한 2자-100자' })
  search: string;
}
