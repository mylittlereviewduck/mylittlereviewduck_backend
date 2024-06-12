import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class BookmarkCheckerService {
  isBookmarked: (userIdx: number, reviewIdx: number) => Promise<boolean>;
}
