import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FollowService } from './follow.service';
import { UserBlockService } from './user-block.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from '../../src/auth/auth.module';
import { FollowCheckService } from './follow-check.service';
import { UserBlockCheckService } from './user-block-check.service';
import { AwsModule } from '../aws/aws.module';
import { NotificationModule } from 'src/notification/notification.module';
import { EmailModule } from '../email/email.module';
import { UserSuspensionService } from './user-suspension.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    AwsModule,
    NotificationModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    FollowService,
    UserBlockService,
    FollowCheckService,
    UserBlockCheckService,
    UserSuspensionService,
  ],
  exports: [
    UserService,
    UserBlockService,
    FollowCheckService,
    UserBlockCheckService,
  ],
})
export class UserModule {}
