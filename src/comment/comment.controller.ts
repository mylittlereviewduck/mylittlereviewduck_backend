import { CommentService } from './comment.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { CreateCommentDto } from './dto/CreateComment.dto';
import { UpdateCommentDto } from './dto/UpdateComment.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';

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
  async getCommemtAllByReviewIdx(@Query('reviewIdx') reviewIdx: number) {
    await this.commentService.getCommentAll(reviewIdx);
  }

  @Post('/review/:reviewIdx/comment')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201 })
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() loginUser: LoginUser,
  ) {
    await this.commentService.createComment(createCommentDto, loginUser);
  }

  @Put('/review/:reviewIdx/comment/:commentIdx')
  @ApiOperation({ summary: '댓글 수정' })
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
  ) {
    await this.commentService.updateComment(updateCommentDto, loginUser);
  }

  @Delete('/review/:reviewIdx/comment/:commentIdx')
  @ApiOperation({ summary: '댓글 삭제' })
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
  ) {
    await this.commentService.deleteComment(commentIdx, loginUser);
  }

  @Post('/review/:reviewIdx/comment/:commentIdx/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요 해제' })
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
