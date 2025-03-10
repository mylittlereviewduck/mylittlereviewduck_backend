import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OpinionService } from './opinion.service';
import { OpinionController } from './opinion.controller';

@Module({
  imports: [PrismaModule],
  controllers: [OpinionController],
  providers: [OpinionService],
  exports: [],
})
export class OpinionModule {}
