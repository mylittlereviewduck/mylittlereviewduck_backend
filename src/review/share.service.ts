// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { ReviewService } from './review.service';
// import { ReviewShareEntity } from './entity/ReviewShare.entity';

// @Injectable()
// export class ReviewShareService {
//   constructor(
//     private readonly prismaService: PrismaService,
//     private readonly reviewService: ReviewService,
//   ) {}

//   async shareReview(
//     userIdx: string,
//     reviewIdx: number,
//   ): Promise<ReviewShareEntity> {
//     const review = await this.reviewService.getReviewByIdx(reviewIdx);
//     if (!review) {
//       throw new NotFoundException('Not Found Review');
//     }

//     const existingShare = await this.prismaService.reviewShareTb.findFirst({
//       where: {
//         accountIdx: userIdx,
//         reviewIdx: reviewIdx,
//       },
//     });

//     if (existingShare) {
//       return;
//     }

//     const reviewShareData = await this.prismaService.reviewShareTb.create({
//       data: {
//         accountIdx: userIdx,
//         reviewIdx: reviewIdx,
//       },
//     });
//     return new ReviewShareEntity(reviewShareData);
//   }
// }
