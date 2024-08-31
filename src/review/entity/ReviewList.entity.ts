import { PickType } from '@nestjs/swagger';
import { ReviewEntity } from './Review.entity';
import { Prisma } from '@prisma/client';
import { ReviewListUserEntity } from './ReviewListUser.entity';

const reivewList = Prisma.validator<Prisma.ReviewTbDefaultArgs>()({
  include: {
    accountTb: {
      include: {
        profileImgTb: {
          where: {
            deletedAt: null,
          },
        },
      },
    },
    tagTb: true,
    reviewImgTb: true,

    _count: {
      select: {
        commentTb: true,
        reviewLikeTb: true,
        reviewDislikeTb: true,
      },
    },
  },
});

type ReviewList = Prisma.ReviewTbGetPayload<typeof reivewList>;

export class ReviewListEntity extends PickType(ReviewEntity, [
  'idx',
  'title',
  'score',
  'createdAt',
  'tags',
  'images',
  'likeCount',
  'dislikeCount',
  'commentCount',
]) {
  user: ReviewListUserEntity;

  constructor(data: ReviewList) {
    super();
    this.idx = data.idx;
    this.title = data.title;
    this.score = data.score;
    this.createdAt = data.createdAt;
    this.user = new ReviewListUserEntity(data.accountTb);
    this.tags = data.tagTb.map((tag) => tag.tagName);
    this.images = data.reviewImgTb.map((image) => image.imgPath);
    this.likeCount = data._count.reviewLikeTb;
    this.dislikeCount = data._count.reviewDislikeTb;
    this.commentCount = data._count.commentTb;
  }
}
