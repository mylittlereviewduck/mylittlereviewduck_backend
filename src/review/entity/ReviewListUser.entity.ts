import { PickType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { UserEntity } from 'src/user/entity/User.entity';

const user = Prisma.validator<Prisma.AccountTbDefaultArgs>()({
  include: {
    profileImgTb: {
      select: {
        imgPath: true,
      },
    },
  },
});

type ReviewListUser = Prisma.AccountTbGetPayload<typeof user>;

export class ReviewListUserEntity extends PickType(UserEntity, [
  'idx',
  'email',
  'nickname',
  'isMyBlock',
]) {
  constructor(data: ReviewListUser) {
    super();
    this.idx = data.idx;
    this.email = data.email;
    this.nickname = data.nickname;
  }
}
