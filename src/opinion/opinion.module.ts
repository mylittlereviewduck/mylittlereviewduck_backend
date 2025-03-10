import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OpinionService } from './opinion.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [OpinionService],
  exports: [],
})
export class OpinionModule {}
