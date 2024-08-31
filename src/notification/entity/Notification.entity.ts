import { Prisma } from '@prisma/client';

const notification = Prisma.validator<Prisma.NotificationTbDefaultArgs>()({});

type Notification = Prisma.NotificationTbGetPayload<typeof notification>;

export class NotificationEntity {
  recipientIdx: string;
  senderIdx: string;
  type: number;
  message: string;
  createdAt: Date;
  readAt: Date;

  constructor(data: Notification) {
    this.recipientIdx = data.recipientIdx;
    this.senderIdx = data.senderIdx;
    this.type = data.type;
    this.message = data.message;
    this.createdAt = data.createdAt;
    this.readAt = data.readAt;
  }
}
