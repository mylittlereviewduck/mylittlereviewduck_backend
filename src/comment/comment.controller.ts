import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { CommentEntity } from './entity/CommentEntity';

@ApiTags('comment')
@Controller()
export class CommentController {
  constructor() {}

  @Get('/review/:reviewIdx/comment/all')
  @ApiOperation({ summary: '댓글 목록보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200, type: CommentEntity })
  async getCommemtAllByReviewIdx() {}

  @Post('/review/:reviewIdx/comment')
  @ApiOperation({ summary: '댓글 작성' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201 })
  async createComment() {}

  @Put('/review/:reviewIdx/comment/:commentIdx')
  @ApiOperation({ summary: '댓글 수정' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateComment() {}

  @Delete('/review/:reviewIdx/comment/:commentIdx')
  @ApiOperation({ summary: '댓글 삭제' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async deleteComment() {}

  @Post('/review/:reviewIdx/comment/:commentIdx/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요' })
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
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200, description: '댓글 좋아요 성공시 200 반환' })
  async unlikeComment() {}
}
