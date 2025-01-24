import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { NotificationEntity } from './entity/Notification.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class SseService {
  private notification$ = new Subject<NotificationEntity>();

  constructor() {}

  sendSse(notification: NotificationEntity) {
    this.notification$.next(notification);
  }

  getNotificationObservable() {
    console.log('notifiacation:', this.notification$);
    return this.notification$.asObservable();
  }
}
