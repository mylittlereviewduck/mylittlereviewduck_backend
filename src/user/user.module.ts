import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FollowService } from './follow.service';
import { UserBlockService } from './user-block.service';
import { PrismaModule } from '../../src/prisma/prisma.module';
import { AuthModule } from '../../src/auth/auth.module';
import { FollowCheckService } from './follow-check.service';
import { UserBlockCheckService } from './user-block-check.service';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), AwsModule],
  controllers: [UserController],
  providers: [
    UserService,
    FollowService,
    UserBlockService,
    FollowCheckService,
    UserBlockCheckService,
  ],
  exports: [UserService, UserBlockService],
})
export class UserModule {}
