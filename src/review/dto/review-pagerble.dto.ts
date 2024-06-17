export class ReviewPagerbleDto {
  userIdx?: number;

  reviewIdx?: number;

  size: number = 10;

  orderby: 'createdAt' | 'view' = 'createdAt';

  sort: 'asc' | 'desc' = 'desc';
}
