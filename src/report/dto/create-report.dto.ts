import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({
    description: `리뷰 신고타입 -> 1: spam / 2: ilegal_product / 3: harmful_to_children / 4: sexsual / 5: hate_or_discrimination / 6: offensive / 7: other  
      각각의 타입에 맞게 1-7범위의 숫자로 주셔야합니다.`,
    example: 1,
    required: true,
  })
  @IsInt({ message: 'type은 정수여야 합니다.' })
  @Min(1, { message: 'type은 최소 1이어야 합니다.' })
  @Max(7, { message: 'type은 최대 7이어야 합니다.' })
  type: number = 7;

  @ApiProperty({
    description: '신고내용, 글자제한 0-1000자',
    example: '신고내용',
  })
  @IsString()
  @Length(0, 1000)
  content: string;

  reporterIdx?: string;

  commentIdx?: number;
  reviewIdx?: number;
}
