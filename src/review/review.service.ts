import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/CreateReview.dto';
import { ReviewEntity } from './entity/Review.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  getReviewAllByUserIdx: (userIdx: number) => Promise<ReviewEntity[]>;

  getReviewAllBySearch: (search: number) => Promise<ReviewEntity[]>;

  createReview: (
    loginUser: any,
    createDto: CreateReviewDto,
  ) => Promise<ReviewEntity>;

  updateMyReview: (reviewIdx: number, userIdx: number) => Promise<void>;

  deleteMyReview: (reviewIdx: number, userIdx: number) => Promise<void>;
}
