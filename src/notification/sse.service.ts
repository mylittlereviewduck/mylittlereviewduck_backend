import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject } from 'rxjs';
import { NotificationEntity } from './entity/Notification.entity';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ReviewService } from 'src/review/review.service';

@Injectable()
export class SseService {
  private notification$ = new Subject<any>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly reviewService: ReviewService,
  ) {}

  @OnEvent('notification.create')
  async handleNotificationEvent(dto: CreateNotificationDto) {
    console.log('알림생성이벤트발생');

    const notification: NotificationEntity =
      await this.notificationService.createNotification({
        senderIdx: dto.senderIdx,
        recipientIdx: dto.recipientIdx,
        commentIdx: dto.commentIdx,
        type: dto.type,
        reviewIdx: dto.reviewIdx,
      });

    this.notification$.next(notification);
  }

  // createSSE(userIdx: string): void {
  //   const notification = {
  //     userIdx,
  //     message: '새로운 댓글이 작성되었습니다.',
  //   };
  //   this.notification$.next(notification);
  // }

  getNotificationObservable() {
    console.log('Notification Observable 구독 시작');
    return this.notification$.asObservable();
  }
}
