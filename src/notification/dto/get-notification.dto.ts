import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetNotificationDto {
  userIdx?: string;

  @ApiProperty({
    description: '한 페이지에 담긴 알람 수',
    default: 20,
  })
  @IsInt()
  size: number = 10;

  @ApiProperty({
    description: '가져올 페이지',
    default: 1,
  })
  @IsInt()
  page: number = 1;
}
