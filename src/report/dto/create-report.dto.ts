import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description:
      '리뷰 신고타입 -> 1: spam / 2: ilegal_product / 3: harmful_to_children / 4: sexsual / 5: hate_or_discrimination / 6: offensive / 7: other',
    example: 1,
    required: true,
  })
  type: number;

  @ApiProperty({
    description: '신고내용',
    example: '신고내용',
  })
  content?: string;

  reporterIdx?: string;

  commentIdx?: number;
  reviewIdx?: number;
}
