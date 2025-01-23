import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as firebaseConfig from './firebase.config.json';
import {
  MulticastMessage,
  TokenMessage,
} from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
  constructor() {
    const serviceAccount = firebaseConfig as admin.ServiceAccount;

    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }

  async fcm(
    token: string | string[],
    title: string,
    body: string,
  ): Promise<void> {
    let result;

    try {
      // 한사람에게만 알림보내기
      if (typeof token == 'string') {
        const message = {
          token: token,
          notification: {
            title: title,
            body: body,
          },
        } as TokenMessage;

        result = await admin.messaging().send(message);
      }

      // 여러명에게 알림보내기
      if (Array.isArray(token)) {
        const message = {
          tokens: token,
          notification: {
            title: title,
            body: body,
          },
        } as MulticastMessage;

        result = await admin.messaging().sendEachForMulticast(message);
      }
    } catch (err) {
      console.error('알림 전송 실패 : ', err);
    }
  }
}
