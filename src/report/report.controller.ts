import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportService } from './report.service';
import { Exception } from 'src/decorator/exception.decorator';
import { ReportEntity } from './entity/Report.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('')
@ApiTags('user')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('/review/:reviewIdx/report')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 신고하기' })
  @ApiParam({
    name: 'reviewIdx',
    type: 'number',
    example: 1,
    description: '리뷰 식별자',
  })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200, type: ReportEntity })
  async reportReview(
    @GetUser() loginUser: LoginUser,
    @Body() dto: CreateReportDto,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReportEntity> {
    return await this.reportService.report({
      reporterIdx: loginUser.idx,
      reviewIdx: reviewIdx,
      type: dto.type,
      content: dto.content,
    });
  }

  @Post('/comment/:commentIdx/report')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '댓글 신고하기' })
  @ApiParam({ name: 'commentIdx', example: 1, description: '댓글 식별자' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200, type: ReportEntity })
  async reportComment(
    @GetUser() loginUser: LoginUser,
    @Body() dto: CreateReportDto,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<ReportEntity> {
    return await this.reportService.report({
      reporterIdx: loginUser.idx,
      commentIdx: commentIdx,
      type: dto.type,
      content: dto.content,
    });
  }
}
