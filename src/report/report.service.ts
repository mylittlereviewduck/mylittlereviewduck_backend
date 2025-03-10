import { ConflictException, Injectable } from '@nestjs/common';
import { GetReportDto } from './dto/get-report.dto';
import { ReportEntity } from './entity/Report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { ReportPagerbleResponseDto } from './dto/response/report-pagerble.response.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: PrismaService) {}

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
      include: {
        accountTb: true,
        reportTypeTb: true,
      },
    });

    return new ReportEntity(newReport);
  }

  async getReportByIdx(dto: GetReportDto): Promise<ReportEntity | null> {
    const reportData = await this.prismaService.reportTb.findFirst({
      where: {
        reporterIdx: dto.reporterIdx,
        commentIdx: dto.commentIdx,
        reviewIdx: dto.reviewIdx,
      },
      include: {
        accountTb: true,
        reportTypeTb: true,
      },
    });

    if (!reportData) {
      return null;
    }

    return new ReportEntity(reportData);
  }

  async getReportsAll(dto: PagerbleDto): Promise<ReportPagerbleResponseDto> {
    const totalCount = await this.prismaService.reportTb.count({
      where: {
        deletedAt: null,
      },
    });

    const reportData = await this.prismaService.reportTb.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        accountTb: true,
        reportTypeTb: true,
      },
      orderBy: {
        idx: 'desc',
      },
      take: dto.size,
      skip: (dto.page - 1) * dto.size,
    });

    return {
      totalPage: Math.ceil(totalCount / dto.size),
      reports: reportData.map((elem) => new ReportEntity(elem)),
    };
  }
}
