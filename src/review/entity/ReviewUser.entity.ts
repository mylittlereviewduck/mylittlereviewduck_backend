import { PickType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { User, UserEntity } from 'src/user/entity/User.entity';

const user = Prisma.validator<Prisma.AccountTbDefaultArgs>()({
  include: {
    profileImgTb: true,
  },
});

type ReviewUser = Prisma.AccountTbGetPayload<typeof user>;

export class ReviewUserEntity extends PickType(UserEntity, [
  'idx',
  'email',
  'nickname',
  'profileImg',
  'interest1',
  'interest2',
]) {
  constructor(data: ReviewUser) {
    super();
    this.idx = data.idx;
    this.email = data.email;
    this.nickname = data.nickname;
    this.profileImg = data.profileImgTb[0].imgPath;
    this.interest1 = data.interest1;
    this.interest2 = data.interest2;
  }
}
