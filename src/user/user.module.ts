import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FollowService } from './follow.service';
import { UserBlockService } from './userBlock.service';
import { BookmarkService } from 'src/review/bookmark.service';

@Module({
  imports: [BookmarkService],
  controllers: [UserController],
  providers: [UserService, FollowService, UserBlockService],
  exports: [],
})
export class UserModule {}
