export class ReviewPagerbleDto {
  userIdx?: number;

  reviewIdx?: number;

  orderby: 'createdAt' | 'view';

  sort: 'asc' | 'desc';
}
