import { PickType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { UserEntity } from 'src/user/entity/User.entity';

const user = Prisma.validator<Prisma.AccountTbDefaultArgs>()({
  include: {
    profileImgTb: true,
  },
});

type NotificationUser = Prisma.AccountTbGetPayload<typeof user>;

export class NotificationUserEntity extends PickType(UserEntity, [
  'idx',
  'email',
  'nickname',
  'profileImg',
  'isMyFollowing',
]) {
  constructor(data: NotificationUser) {
    super();
    this.idx = data.idx;
    this.email = data.email;
    this.nickname = data.nickname;
    this.profileImg = data.profileImgTb[0].imgPath;
  }
}
