import { ConflictException, Injectable } from '@nestjs/common';
import { GetReportDto } from './dto/get-report.dto';
import { ReportEntity } from './entity/Report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async getReportByIdx(dto: GetReportDto): Promise<ReportEntity | undefined> {
    const reportData = await this.prismaService.reportTb.findFirst({
      where: {
        reporterIdx: dto.reporterIdx,
        commentIdx: dto.commentIdx,
        reviewIdx: dto.reviewIdx,
      },
    });

    return new ReportEntity(reportData);
  }

  async report(dto: CreateReportDto): Promise<ReportEntity> {
    const existingReport = await this.getReportByIdx({
      reporterIdx: dto.reporterIdx,
      reviewIdx: dto.reviewIdx,
      commentIdx: dto.commentIdx,
    });

    if (existingReport) {
      throw new ConflictException('Already Reported');
    }

    const newReport = await this.prismaService.reportTb.create({
      data: {
        reporterIdx: dto.reporterIdx,
        commentIdx: dto.commentIdx,
        reviewIdx: dto.reviewIdx,
        type: dto.type,
        content: dto.content,
      },
    });

    return new ReportEntity(newReport);
  }
}
