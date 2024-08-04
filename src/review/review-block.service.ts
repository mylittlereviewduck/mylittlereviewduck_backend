import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewBlockService {
  constructor() {}

  blockReview: (accountIdx: number, reviewIdx: number) => Promise<void>;
}
