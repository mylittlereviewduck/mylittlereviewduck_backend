import { IsString, Length } from 'class-validator';

export class createOpinionDto {
  @IsString()
  @Length(1, 150)
  title: string;

  @IsString()
  @Length(1, 5000)
  content: string;
}
