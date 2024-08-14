import { CommentLikeService } from './comment-like.service';
import { CommentService } from './comment.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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

@ApiTags('comment')
@Controller()
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly commentLikeService: CommentLikeService,
    private readonly commentLikeCheckService: CommentLikeCheckService,
  ) {}

  //댓글 uri에서 reviewIdx뺄지 검토
  @Get('/review/:reviewIdx/comment/all')
  @ApiOperation({ summary: '댓글 목록보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200, type: CommentEntity, isArray: true })
  async getCommemtAllByReviewIdx(
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<CommentEntity[]> {
    return await this.commentService.getCommentAll(reviewIdx);
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
    return await this.commentService.createComment(
      loginUser.idx,
      reviewIdx,
      createCommentDto,
    );
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
  @ApiResponse({ status: 200 })
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
  @ApiResponse({ status: 200, description: '댓글 좋아요 성공시 200 반환' })
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
