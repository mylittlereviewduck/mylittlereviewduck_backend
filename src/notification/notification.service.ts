import { OnEvent } from '@nestjs/event-emitter';
import { GetNotificationDto } from './dto/get-notification.dto';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserService } from 'src/user/user.service';
import { Notification, NotificationEntity } from './entity/Notification.entity';
import { NotificationPagerbleResponseDto } from './dto/response/notification-pagerble-response.dto';
import { Subject } from 'rxjs';
import { CommentService } from 'src/comment/comment.service';
import { CommentEntity } from 'src/comment/entity/Comment.entity';
import { ReviewEntity } from 'src/review/entity/Review.entity';
import { ReviewService } from 'src/review/review.service';
import { FcmTokenService } from 'src/user/fcm-token.service';
import { FirebaseService } from './firebase.service';

@Injectable()
export class NotificationService {
  private users$: Subject<any> = new Subject();
  private observer = this.users$.asObservable();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly reviewService: ReviewService,
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
    private readonly fcmTokenService: FcmTokenService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * @param createNotificationDto 
   * @description
   * type
   * - 1 = follow_user
     - 2 = like_review
     - 3 = create_comment
   */
  @OnEvent('notification.create', { async: true })
  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    let content: string;
    let comment: CommentEntity;
    let review: ReviewEntity;

    const sender = await this.userService.getUser({
      idx: dto.senderIdx,
    });

    if (dto.reviewIdx)
      review = await this.reviewService.getReviewByIdx(dto.reviewIdx);
    if (dto.commentIdx)
      comment = await this.commentService.getCommentByIdx(dto.commentIdx);

    if (dto.type == 1) {
      content = `${sender.nickname}님이 회원님을 팔로우합니다.`;
    } else if (dto.type == 2) {
      content = `${sender.nickname}님이 리뷰를 좋아합니다.`;
    } else if (dto.type == 3) {
      content = `${sender.nickname}님이 댓글을 남겼습니다.: ${comment.content}`;
    }

    const notificationData = await this.prismaService.notificationTb.create({
      data: {
        senderIdx: sender.idx,
        recipientIdx: dto.recipientIdx,
        type: dto.type,
        content: content,
        ...(review && { reviewIdx: review.idx }),
      },
      include: {
        senderAccountTb: true,
        notificationTypeTb: {
          select: {
            typeName: true,
          },
        },
      },
    });

    return new NotificationEntity(notificationData);
  }

  async getMyNotificationAll(
    dto: GetNotificationDto,
  ): Promise<NotificationPagerbleResponseDto> {
    let totalCount: number, notificationData: Notification[];

    await this.prismaService.$transaction(async (tx) => {
      totalCount = await tx.notificationTb.count({
        where: {
          recipientIdx: dto.userIdx,
        },
      });

      notificationData = await tx.notificationTb.findMany({
        include: {
          senderAccountTb: true,
          notificationTypeTb: {
            select: {
              typeName: true,
            },
          },
        },
        where: {
          recipientIdx: dto.userIdx,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: dto.size,
        skip: (dto.page - 1) * dto.size,
      });

      await tx.notificationTb.updateMany({
        data: {
          readAt: new Date(),
        },
        where: {
          recipientIdx: dto.userIdx,
        },
      });
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      notifications: notificationData.map(
        (notification) => new NotificationEntity(notification),
      ),
    };
  }

  @OnEvent('notification.follow', { async: true })
  async handleFollowEvent(senderIdx: string, toUserIdx: string) {
    console.log('팔로우 이벤트 정상실행');
    try {
      const token = await this.fcmTokenService.getFcmTokens([toUserIdx]);

      const sender = await this.userService.getUser({ idx: senderIdx });
      const title = `${sender.nickname}님이 회원님을 팔로우합니다.`;
      const body = `${sender.nickname}님이 회원님을 팔로우합니다.`;

      await Promise.all([
        this.firebaseService.sendFcm(token, title, body),
        this.createNotification({
          senderIdx: sender.idx,
          recipientIdx: toUserIdx,
          type: 1,
        }),
      ]);
    } catch (err) {
      console.error('알림 전송 실패:', err);
    }
  }
}
