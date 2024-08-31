export class CreateNotificationDto {
  senderIdx: string;
  recipientIdx: string;
  type: number;
  content?: string;
}
