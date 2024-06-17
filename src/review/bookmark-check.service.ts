import { Injectable } from '@nestjs/common';
import { ReviewEntity } from './entity/Review.entity';

@Injectable()
export class BookmarkCheckService {
  constructor() {}
  isBookmarked: (userIdx: number, reviewIdx: number) => Promise<boolean>;
}
