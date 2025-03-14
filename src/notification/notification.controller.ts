import { AuthGuard } from '../auth/guard/auth.guard';
import {
  Controller,
  Get,
  MessageEvent,
  Query,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { Exception } from 'src/common/decorator/exception.decorator';
import { NotificationPagerbleResponseDto } from './dto/response/notification-pagerble-response.dto';
import { NotificationService } from './notification.service';
import { Observable, filter, interval, map } from 'rxjs';
import { UserFollowService } from 'src/user/user-follow.service';
import { SseService } from './sse.service';
import { NotificationEntity } from './entity/Notification.entity';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';

@Controller('')
@ApiTags('user')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userFollowService: UserFollowService,
    private readonly sseService: SseService,
  ) {}

  @Get('/user/notification/all')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 알림목록보기' })
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: NotificationPagerbleResponseDto })
  async getMyNotifications(
    @Query() dto: PagerbleDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<NotificationPagerbleResponseDto> {
    const notificationPagerbleResponseDto =
      await this.notificationService.getMyNotificationAll(
        {
          page: dto.page,
          size: dto.size,
        },
        loginUser.idx,
      );

    await this.userFollowService.isFollow(
      loginUser.idx,
      notificationPagerbleResponseDto.notifications.map(
        (notification) => notification.sender,
      ),
    );

    return notificationPagerbleResponseDto;
  }

  @Sse('/notification/sse')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'SSE 연결요청' })
  sendClientNotification(
    @GetUser() loginUser: LoginUser,
  ): Observable<MessageEvent> {
    return this.sseService.getNotificationObservable().pipe(
      filter(
        (notification: NotificationEntity) =>
          notification.recipientIdx === loginUser.idx,
      ),
      map((notification: NotificationEntity) => ({
        data: notification,
      })),
    );
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
  }
}
