import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementEntity } from './entity/Announcement.entity';
import { GetAnnouncementsDto } from './dto/get-announcement.dto';
import { AnnouncementPagerbleResponseDto } from './dto/response/announcement-pagerble-response.dto';

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

  async getAnnounceMents(
    dto: GetAnnouncementsDto,
  ): Promise<AnnouncementPagerbleResponseDto> {
    const totalCount = await this.prismaService.announcementTb.count({
      where: {
        ...(dto.status && { status: dto.status }),
      },
    });

    const announcementData = await this.prismaService.announcementTb.findMany({
      where: {
        ...(dto.status && { status: dto.status }),
      },
      include: {
        accountTb: true,
      },
      orderBy: {
        idx: 'desc',
      },
      take: dto.size,
      skip: (dto.page - 1) * dto.size,
    });

    const totalPage = Math.ceil(totalCount / dto.size);

    const announcements = announcementData.map(
      (data) => new AnnouncementEntity(data),
    );

    return {
      totalPage,
      announcements,
    };
  }
}
