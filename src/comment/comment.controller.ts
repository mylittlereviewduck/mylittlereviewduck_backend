import { CommentService } from './comment.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

@ApiTags('comment')
@Controller()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('/review/:reviewIdx/comment/all')
  @ApiOperation({ summary: '댓글 목록보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200, type: CommentEntity, isArray: true })
  async getCommemtAllByReviewIdx(
    @Param('reviewIdx') reviewIdx: number,
  ): Promise<{ data: CommentEntity[] }> {
    const commentList = await this.commentService.getCommentAll(reviewIdx);

    return { data: commentList };
  }

  @Post('/review/:reviewIdx/comment')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '댓글 작성' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201, type: CommentEntity })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<{ data: CommentEntity }> {
    const commentEntity = await this.commentService.createComment(
      createCommentDto,
      loginUser,
    );

    // 값이 data라는 키값으로 반환되는데 이를 또 타입정의해줘야하는가? Create-Comment-Response
    return { data: commentEntity };
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
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateComment(
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<{ data: CommentEntity }> {
    const commentEntity = await this.commentService.updateComment(
      updateCommentDto,
      loginUser,
    );

    return { data: commentEntity };
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
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async deleteComment(
    @Param('commentIdx') commentIdx: number,
    @GetUser() loginUser: LoginUser,
  ): Promise<{ data: CommentEntity }> {
    const comment = await this.commentService.deleteComment(
      commentIdx,
      loginUser,
    );

    return { data: comment };
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
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200, description: '댓글 좋아요 성공시 200 반환' })
  async likeComment() {}

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
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200, description: '댓글 좋아요 해제 성공시 200 반환' })
  async unlikeComment() {}
}
