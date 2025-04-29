import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementEntity } from './entity/Announcement.entity';
import { GetAnnouncementsDto } from './dto/get-announcement.dto';
import { AnnouncementPagerbleResponseDto } from './dto/response/announcement-pagerble-response.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Prisma } from '@prisma/client';

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
        deletedAt: null,
      },
    });

    const announcementData = await this.prismaService.announcementTb.findMany({
      where: {
        ...(dto.status && { status: dto.status }),
        deletedAt: null,
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

  async getAnnouncementByIdx(
    announcementIdx: number,
    tx?: Prisma.TransactionClient,
  ): Promise<AnnouncementEntity | null> {
    const result = await this.prismaService.announcementTb.findUnique({
      where: {
        idx: announcementIdx,
        deletedAt: null,
      },
      include: {
        accountTb: true,
      },
    });

    if (!result) {
      return null;
    }

    return new AnnouncementEntity(result);
  }

  async updateAnnouncement(
    dto: UpdateAnnouncementDto,
    announcementIdx: number,
    loginUserIdx: string,
    tx?: Prisma.TransactionClient,
  ): Promise<AnnouncementEntity> {
    if (
      !dto.title &&
      !dto.content &&
      !dto.category &&
      !dto.status &&
      !dto.isPinned
    )
      throw new BadRequestException('5가지 속성중 최소 한개는 주셔야 합니다.');

    return await this.prismaService.$transaction(async (tx) => {
      const foundAnnouncement = await this.getAnnouncementByIdx(
        announcementIdx,
        tx,
      );

      if (!foundAnnouncement)
        throw new NotFoundException('Not Found Announcement');

      if (foundAnnouncement.user.idx !== loginUserIdx)
        throw new UnauthorizedException('수정권한이 없습니다.');

      const announcementData = await tx.announcementTb.update({
        where: {
          idx: announcementIdx,
          deletedAt: null,
        },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.content && { content: dto.content }),
          ...(dto.category && { category: dto.category }),
          ...(dto.status && { status: dto.status }),
          ...(dto.isPinned && { isPinned: dto.isPinned }),
          updatedAt: new Date(),
        },
        include: {
          accountTb: true,
        },
      });
      return new AnnouncementEntity(announcementData);
    });
  }
}
