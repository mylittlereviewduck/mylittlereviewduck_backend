import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewShareCheckService {
  constructor() {}

  isReviewShared: (accountIdx: number, reviewIdx: number) => Promise<void>;
}
