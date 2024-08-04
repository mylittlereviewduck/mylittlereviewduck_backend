import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewShareService {
  constructor() {}

  shareReview: (accountIdx: number, reviewIdx: number) => Promise<void>;
}
