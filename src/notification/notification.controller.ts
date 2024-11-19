import { AuthGuard } from '../auth/guard/auth.guard';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { GetUser } from 'src/auth/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { Exception } from 'src/decorator/exception.decorator';
import { NotificationPagerbleResponseDto } from './dto/response/notification-pagerble-response.dto';
import { NotificationService } from './notification.service';
import { Observable, interval, map } from 'rxjs';
import { NotificationEntity } from './entity/Notification.entity';
import { GetNotificationDto } from './dto/get-notification.dto';
import { UserFollowService } from 'src/user/user-follow.service';
import { SseService } from './sse.service';

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
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: NotificationPagerbleResponseDto })
  async getMyNotifications(
    @Query() dto: GetNotificationDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<NotificationPagerbleResponseDto> {
    const notificationPagerbleResponseDto =
      await this.notificationService.getMyNotificationAll({
        userIdx: loginUser.idx,
        page: dto.page || 1,
        size: dto.size || 20,
      });

    await this.userFollowService.isFollow(
      loginUser.idx,
      notificationPagerbleResponseDto.notifications.map(
        (notification) => notification.sender,
      ),
    );

    return notificationPagerbleResponseDto;
  }

  @Sse('/notification/sse')
  // @UseGuards(AuthGuard)
  sendClientNotification(@GetUser() loginUser: LoginUser): Observable<any> {
    // return interval(1000).pipe(map((_) => ({ data: { hello: 'world' } })));
    return this.sseService.getNotificationObservable().pipe(
      map((notification) => ({
        data: notification,
      })),
    );
  }
}
