export class GetReviewsWithUserStatusDto {
  size: number;
  page: number;
  userIdx: string;
  loginUserIdx: string | null;
}
