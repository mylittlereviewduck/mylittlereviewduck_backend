import { NotificationEntity } from 'src/notification/entity/Notification.entity';

export class NotificationPagerbleResponseDto {
  totalPage: number;
  notifications: NotificationEntity[];
}
