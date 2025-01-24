import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { NotificationEntity } from './entity/Notification.entity';

@Injectable()
export class SseService {
  private notification$ = new Subject<NotificationEntity>();

  constructor() {}

  sendSse(notification: NotificationEntity) {
    this.notification$.next(notification);
  }

  getNotificationObservable(): Observable<NotificationEntity> {
    console.log('notifiacation:', this.notification$);
    return this.notification$.asObservable();
  }
}
