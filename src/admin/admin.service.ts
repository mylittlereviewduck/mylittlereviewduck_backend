import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementEntity } from './entity/Announcement.entity';

@Injectable()
export class AdminService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAnnouncement(
    dto: CreateAnnouncementDto,
    userIdx: string,
  ): Promise<AnnouncementEntity> {
    const announcementData = await this.prismaService.announcementTb.create({
      data: {
        accountIdx: userIdx,
        title: dto.title,
        content: dto.content,
        category: dto.category,
        status: dto.status,
      },
      include: {
        accountTb: true,
      },
    });

    return new AnnouncementEntity(announcementData);
  }
}
