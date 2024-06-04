import { ApiProperty } from '@nestjs/swagger';

export class GetFollowingAllDto {
  @ApiProperty()
  idx: number;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  profileImg: string;
}
