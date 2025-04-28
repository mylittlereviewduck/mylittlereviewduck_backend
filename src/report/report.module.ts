import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ReviewModule } from 'src/review/review.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [PrismaModule, ReviewModule, CommentModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
