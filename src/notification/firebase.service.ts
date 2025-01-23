import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as firebaseConfig from './firebase.config.json';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';
import { FcmTokenService } from 'src/user/fcm-token.service';

@Injectable()
export class FirebaseService {
  constructor(private readonly fcmTokenService: FcmTokenService) {
    const serviceAccount = firebaseConfig as admin.ServiceAccount;

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  async sendFcm(
    title: string,
    body: string,
    userIdxs: string[] | null,
  ): Promise<void> {
    let result;
    let tokens;

    //유저 token조회
    if (userIdxs) {
      tokens = await this.fcmTokenService.getFcmTokens(userIdxs);
    } else {
      tokens = await this.fcmTokenService.getFcmTokenAll();
    }

    try {
      const message = {
        tokens: tokens,
        notification: {
          title: title,
          body: body,
        },
      } as MulticastMessage;

      result = await admin.messaging().sendEachForMulticast(message);
    } catch (err) {
      console.error('알림 전송 실패 : ', err);
    }
  }
}
