import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entity/User.entity';

export class UserSearchResponseDto {
  @ApiProperty({ example: 10, description: '최대 페이지수' })
  totalPage: number;

  @ApiProperty({
    example: [],
    isArray: true,
  })
  users: UserEntity[];
}
