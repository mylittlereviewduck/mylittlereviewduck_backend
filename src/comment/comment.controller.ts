import { CommentLikeService } from './comment-like.service';
import { CommentService } from './comment.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { CommentEntity } from './entity/Comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { AuthGuard } from 'src/auth/auth.guard';
import { CommentLikeCheckService } from './comment-like-check.service';
import { CommentLikeEntity } from './entity/CommentLike.entity';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';
import { CommentPagerbleResponseDto } from './dto/response/comment-pagerble-response.dto';
import { NotificationService } from 'src/notification/notification.service';
import { ReviewService } from 'src/review/review.service';

@ApiTags('comment')
@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentLikeService: CommentLikeService,
    private readonly commentLikeCheckService: CommentLikeCheckService,
    private readonly notificationService: NotificationService,
    private readonly reviewService: ReviewService,
  ) {}

  @Get('/review/:reviewIdx/comment/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '댓글 목록보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '한 페이지에 담긴 리뷰수, 기본값 10',
  })
  @ApiQuery({
    name: 'page',
    example: 1,
    description: '가져올 페이지, 기본값 1',
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200, type: CommentPagerbleResponseDto, isArray: true })
  async getCommemtAllByReviewIdx(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<CommentPagerbleResponseDto> {
    const commentPagerbleResponseDto = await this.commentService.getCommentAll({
      reviewIdx: reviewIdx,
      size: size || 10,
      page: page || 1,
    });

    if (!loginUser) {
      return commentPagerbleResponseDto;
    }

    await this.commentLikeCheckService.isCommentLiked(
      loginUser.idx,
      commentPagerbleResponseDto.comments,
    );

    return commentPagerbleResponseDto;
  }

  @Post('/review/:reviewIdx/comment')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '댓글 작성' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 201, type: CommentEntity })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @GetUser() loginUser: LoginUser,
  ): Promise<CommentEntity> {
    const commentEntity = await this.commentService.createComment(
      loginUser.idx,
      reviewIdx,
      createCommentDto,
    );

    const reviewEntity = await this.reviewService.getReviewByIdx(
      commentEntity.reviewIdx,
    );

    if (loginUser.idx !== reviewEntity.user.idx) {
      const notification = await this.notificationService.createNotification({
        senderIdx: loginUser.idx,
        recipientIdx: reviewEntity.user.idx,
        commentContent: commentEntity.content,
        type: 3,
        reviewIdx: reviewIdx,
      });

      this.notificationService.sendNotification(notification);
    }

    return commentEntity;
  }

  @Put('/review/:reviewIdx/comment/:commentIdx')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '댓글 수정' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @ApiParam({ name: 'commentIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200, type: CommentEntity })
  async updateComment(
    @GetUser() loginUser: LoginUser,
    @Body() updateCommentDto: UpdateCommentDto,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<CommentEntity> {
    return await this.commentService.updateComment(
      loginUser.idx,
      reviewIdx,
      commentIdx,
      updateCommentDto,
    );
  }

  @Delete('/review/:reviewIdx/comment/:commentIdx')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @ApiParam({ name: 'commentIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200 })
  async deleteComment(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<void> {
    await this.commentService.deleteComment(
      loginUser.idx,
      reviewIdx,
      commentIdx,
    );
  }

  @Post('/review/:reviewIdx/comment/:commentIdx/like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @ApiParam({ name: 'commentIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({
    status: 200,
    description: '댓글 좋아요 성공시 200 반환',
    type: CommentLikeEntity,
  })
  async likeComment(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<CommentLikeEntity> {
    return await this.commentLikeService.likeComment(
      loginUser.idx,
      reviewIdx,
      commentIdx,
    );
  }

  @Delete('/review/:reviewIdx/comment/:commentIdx/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '댓글 좋아요 해제' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @ApiParam({ name: 'commentIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200, description: '댓글 좋아요 해제 성공시 200 반환' })
  async unlikeComment(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<void> {
    return await this.commentLikeService.unlikeComment(
      loginUser.idx,
      reviewIdx,
      commentIdx,
    );
  }
}
