import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewLikeService {
  constructor(private readonly prismaService: PrismaService) {}

  likeReview: (userIdx: number, reviewIdx: number) => Promise<void>;

  unlikeReview: (userIdx: number, reviewIdx: number) => Promise<void>;
}
