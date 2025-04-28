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
import { Exception } from 'src/common/decorator/exception.decorator';
import { ReportEntity } from './entity/Report.entity';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { CreateReportReviewDto } from './dto/create-report-review.dto';
import { CreateReportCommentDto } from './dto/create-report-comment.dto';

@Controller('')
@ApiTags('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('/review/:reviewIdx/report')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '리뷰 신고하기',
    description: `type ->  
     1: spam  
     2: ilegal_p,roduct  
     3: harmful_to_children  
     4: sexsual  
     5: hate_or_discrimination  
     6: offensive  
     7: other  
각각의 타입에 맞게 1-7범위의 숫자로 주셔야합니다.    `,
  })
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
    @Body() dto: CreateReportReviewDto,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReportEntity> {
    return await this.reportService.reportReview(
      {
        reviewIdx: reviewIdx,
        type: dto.type,
        content: dto.content,
      },
      loginUser.idx,
    );
  }

  @Post('/comment/:commentIdx/report')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: '댓글 신고하기',
    description: `type ->  
  1: spam  
  2: ilegal_p,roduct  
  3: harmful_to_children  
  4: sexsual  
  5: hate_or_discrimination  
  6: offensive  
  7: other  
각각의 타입에 맞게 1-7범위의 숫자로 주셔야합니다.  `,
  })
  @ApiParam({
    name: 'commentIdx',
    example: 1,
  })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200, type: ReportEntity })
  async reportComment(
    @GetUser() loginUser: LoginUser,
    @Body() dto: CreateReportCommentDto,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<ReportEntity> {
    return await this.reportService.reportComment(
      {
        commentIdx: commentIdx,
        type: dto.type,
        content: dto.content,
      },
      loginUser.idx,
    );
  }
}
