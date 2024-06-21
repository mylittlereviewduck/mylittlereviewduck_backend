export class ReviewPagerbleDto {
  userIdx?: number;

  reviewIdx?: number;

  size: number;

  orderby: 'createdAt' | 'view';

  sort: 'asc' | 'desc';
}
