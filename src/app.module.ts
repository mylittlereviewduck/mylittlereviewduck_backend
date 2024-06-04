import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { ReviewController } from './review/review.controller';
import { ReviewModule } from './review/review.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [UserModule, AuthModule, ReviewModule, CommentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
