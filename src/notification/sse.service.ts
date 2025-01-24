import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject } from 'rxjs';
import { NotificationEntity } from './entity/Notification.entity';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class SseService {
  private notification$ = new Subject<NotificationEntity>();

  constructor(private readonly notificationService: NotificationService) {}

  async handleNotificationEvent(dto: CreateNotificationDto) {
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

  getNotificationObservable() {
    console.log('notifiacation:', this.notification$);
    return this.notification$.asObservable();
  }
}
