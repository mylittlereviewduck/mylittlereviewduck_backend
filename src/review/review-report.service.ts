import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewReportService {
  constructor() {}

  reportReview: (accountIdx: number, reviewIdx: number) => Promise<void>;
}
