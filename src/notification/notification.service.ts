import { GetNotificationDto } from './dto/get-notification.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserService } from 'src/user/user.service';
import { NotificationEntity } from './entity/Notification.entity';
import { NotificationPagerbleResponseDto } from './dto/response/notification-pagerble-response.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  /**
   * 
   * @param createNotificationDto 
   * @description
   * type
   * - 1 = follow
     - 2 = like Review
     - 3 = comment
   */
  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<void> {
    let content: string;

    const sender = await this.userService.getUser({
      idx: createNotificationDto.senderIdx,
    });

    if (createNotificationDto.type == 1) {
      content = `${sender.nickname}님이 회원님을 팔로우하기 시작했습니다.`;
    } else if (createNotificationDto.type == 2) {
      content = `${sender.nickname}님이 내 리뷰를 좋아합니다.`;
    } else if (createNotificationDto.type == 3) {
      content = `${sender.nickname}님이 댓글을 남겼습니다. ${createNotificationDto.commentContent}`;
    }

    await this.prismaService.notificationTb.create({
      data: {
        senderIdx: createNotificationDto.senderIdx,
        recipientIdx: createNotificationDto.recipientIdx,
        type: createNotificationDto.type,
        reviewIdx: createNotificationDto.reviewIdx,
        content: content,
      },
    });
  }

  async getMyNotificationAll(
    getNotificationDto: GetNotificationDto,
  ): Promise<NotificationPagerbleResponseDto> {
    let totalCount, notificationData;

    await this.prismaService.$transaction(async (tx) => {
      totalCount = await tx.notificationTb.count({
        where: {
          recipientIdx: getNotificationDto.userIdx,
        },
      });

      notificationData = await tx.notificationTb.findMany({
        include: {
          senderAccountTb: {
            include: {
              profileImgTb: true,
            },
          },
        },
        where: {
          recipientIdx: getNotificationDto.userIdx,
        },
        take: getNotificationDto.size,
        skip: (getNotificationDto.page - 1) * getNotificationDto.size,
      });

      await tx.notificationTb.updateMany({
        data: {
          readAt: new Date(),
        },
        where: {
          recipientIdx: getNotificationDto.userIdx,
        },
      });
    });

    return {
      totalPage: Math.ceil(totalCount / getNotificationDto.size),
      notifications: notificationData.map(
        (notification) => new NotificationEntity(notification),
      ),
    };
  }
}
