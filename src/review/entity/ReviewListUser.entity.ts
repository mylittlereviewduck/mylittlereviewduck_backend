import { PickType } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entity/User.entity';

export class ReviewListUserEntity extends PickType(UserEntity, [
  'idx',
  'email',
  'nickname',
]) {}
