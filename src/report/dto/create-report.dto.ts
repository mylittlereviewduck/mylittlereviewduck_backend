export class CreateReportDto {
  reporterIdx: string;
  type: number;
  commentIdx?: number;
  reviewIdx?: number;
  content: string;
}
