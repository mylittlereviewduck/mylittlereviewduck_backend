import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GetReportDto } from './dto/get-report.dto';
import { ReportEntity } from './entity/Report.entity';
import { CreateReportReviewDto } from './dto/create-report-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { ReportPagerbleResponseDto } from './dto/response/report-pagerble.response.dto';
import { ReviewService } from 'src/review/review.service';
import { CreateReportCommentDto } from './dto/create-report-comment.dto';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
    private readonly commentService: CommentService,
  ) {}

  async reportReview(
    dto: CreateReportReviewDto,
    loginUserIdx: string,
  ): Promise<ReportEntity> {
    if (!dto.reviewIdx)
      throw new BadRequestException('리뷰 식별자가 주어져야 합니다.');

    const reportedReview = await this.reviewService.getReviewByIdx(
      dto.reviewIdx,
    );

    if (!reportedReview) {
      throw new NotFoundException('Not Found Review');
    }

    const existingReport = await this.getReportByIdx({
      reporterIdx: loginUserIdx,
      reviewIdx: dto.reviewIdx,
    });

    if (existingReport) {
      throw new ConflictException('Already Reported');
    }

    const newReport = await this.prismaService.reportTb.create({
      data: {
        reporterIdx: loginUserIdx,
        reportedIdx: reportedReview.user.idx,
        reviewIdx: dto.reviewIdx,
        type: dto.type,
        content: dto.content,
      },
      include: {
        accountTbReporter: true,
        accountTbReported: true,
        reportTypeTb: true,
      },
    });

    return new ReportEntity(newReport);
  }

  async reportComment(
    dto: CreateReportCommentDto,
    loginUserIdx: string,
  ): Promise<ReportEntity> {
    if (!dto.commentIdx)
      throw new BadRequestException('댓글 식별자가 주어져야 합니다.');

    const reportedComment = await this.commentService.getCommentByIdx(
      dto.commentIdx,
    );

    if (!reportedComment) {
      throw new NotFoundException('Not Found Review');
    }

    const existingReport = await this.getReportByIdx({
      reporterIdx: loginUserIdx,
      commentIdx: dto.commentIdx,
    });

    if (existingReport) {
      throw new ConflictException('Already Reported');
    }

    const newReport = await this.prismaService.reportTb.create({
      data: {
        reporterIdx: loginUserIdx,
        reportedIdx: reportedComment.user.idx,
        commentIdx: dto.commentIdx,
        type: dto.type,
        content: dto.content,
      },
      include: {
        accountTbReporter: true,
        accountTbReported: true,
        reportTypeTb: true,
      },
    });

    return new ReportEntity(newReport);
  }

  async getReportByIdx(dto: GetReportDto): Promise<ReportEntity | null> {
    if (!dto.reviewIdx && !dto.commentIdx)
      throw new BadRequestException(
        '리뷰, 댓글 식별자 중 1개는 주어져야합니다.',
      );

    const reportData = await this.prismaService.reportTb.findFirst({
      where: {
        reporterIdx: dto.reporterIdx,
        ...(dto.commentIdx && { commentIdx: dto.commentIdx }),
        ...(dto.reviewIdx && { commentIdx: dto.reviewIdx }),
      },
      include: {
        accountTbReporter: true,
        accountTbReported: true,
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
        accountTbReporter: true,
        accountTbReported: true,
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
