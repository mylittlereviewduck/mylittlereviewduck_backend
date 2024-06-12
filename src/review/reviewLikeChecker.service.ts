import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class ReviewLikeCheckerService {
  constructor(private readonly prismaService: PrismaService) {}

  isLikedReview: (userIdx: number, reviewIdx: number) => Promise<boolean>;
}
