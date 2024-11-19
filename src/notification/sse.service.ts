import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
  private notification$ = new Subject<any>();

  createSSE(userIdx: string): void {
    console.log('createSSE 시작');
    const notification = {
      userIdx,
      message: '새로운 댓글이 작성되었습니다.',
    };
    this.notification$.next(notification);
  }

  getNotificationObservable() {
    return this.notification$.asObservable();
  }
}
