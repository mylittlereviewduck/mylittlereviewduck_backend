import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FollowService } from './follow.service';
import { UserBlockService } from './userBlock.service';
import { BookmarkService } from 'src/review/bookmark.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, FollowService, UserBlockService],
  exports: [UserService, UserBlockService],
})
export class UserModule {}
