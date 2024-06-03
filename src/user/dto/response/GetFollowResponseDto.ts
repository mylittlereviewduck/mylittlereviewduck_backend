import { ApiProperty } from '@nestjs/swagger';
import { FollowEntity } from 'src/user/entity/FollowEntity';
import { UserEntity } from 'src/user/entity/UserEntity';

export class UserWithFollowStatusDto {
  @ApiProperty({ type: UserEntity })
  user: UserEntity;

  @ApiProperty({ type: FollowEntity })
  isfollowed: FollowEntity;
}
