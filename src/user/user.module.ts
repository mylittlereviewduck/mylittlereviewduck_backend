import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FollowService } from './follow.service';
import { UserBlockService } from './userBlock.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [PrismaModule, AuthGuard],
  controllers: [UserController],
  providers: [UserService, FollowService, UserBlockService],
  exports: [UserService, UserBlockService],
})
export class UserModule {}
