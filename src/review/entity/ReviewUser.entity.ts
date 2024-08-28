import { PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entity/User.entity';

export class ReviewUserEntity extends PickType(UserEntity, [
  'idx',
  'email',
  'nickname',
  'profileImg',
]) {}
