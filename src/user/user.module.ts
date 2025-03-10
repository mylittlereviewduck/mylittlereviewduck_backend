import { ConsoleLogger, Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FollowService } from './follow.service';
import { UserBlockService } from './user-block.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from '../../src/auth/auth.module';
import { UserBlockCheckService } from './user-block-check.service';
import { AwsModule } from '../aws/aws.module';
import { NotificationModule } from 'src/notification/notification.module';
import { EmailModule } from '../email/email.module';
import { UserSuspensionService } from '../admin/user-suspension.service';
import { UserFollowService } from './user-follow.service';
import { FcmTokenService } from './fcm-token.service';
import { SearchKeywordService } from 'src/user/search-keyword.service';
import { UserInteractionService } from './user-interaction.service';
import { ReviewModule } from 'src/review/review.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    AwsModule,
    NotificationModule,
    EmailModule,
    ReviewModule,
  ],
  controllers: [UserController],
  providers: [
    ConsoleLogger,
    UserService,
    FollowService,
    UserBlockService,
    UserFollowService,
    UserBlockCheckService,
    SearchKeywordService,
    FcmTokenService,
    UserInteractionService,
  ],
  exports: [
    UserService,
    UserBlockService,
    UserFollowService,
    UserBlockCheckService,
    SearchKeywordService,
    FcmTokenService,
  ],
})
export class UserModule {}
