import { ApiProperty } from '@nestjs/swagger';
import { AnnouncementEntity } from 'src/admin/entity/Announcement.entity';

export class AnnouncementPagerbleResponseDto {
  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    description: '공지사항 리스트',
    isArray: true,
    type: AnnouncementEntity,
  })
  announcements: AnnouncementEntity[];
}
