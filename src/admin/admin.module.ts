import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { OpinionModule } from 'src/opinion/opinion.module';
import { UserSuspensionService } from './user-suspension.service';
import { UserModule } from 'src/user/user.module';
import { ReportModule } from 'src/report/report.module';

@Module({
  imports: [PrismaModule, OpinionModule, UserModule, ReportModule],
  controllers: [AdminController],
  providers: [AdminService, UserSuspensionService],
  exports: [],
})
export class AdminModule {}
