import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { CreateReviewDto } from './dto/CreateReviewDto';

@Controller('')
@ApiTags('review')
export class ReviewController {
  constructor() {}

  //리뷰자세히보기
  @Post('/review')
  @ApiOperation({ summary: '리뷰 작성하기' })
  @ApiBody({ type: CreateReviewDto })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201 })
  async createReview() {}

  //리뷰수정하기

  //리뷰삭제하기

  //최신리뷰목록보기

  //인기리뷰목록보기

  //리뷰검색하기(태그, 제목, 내용, 닉네임)

  //리뷰북마크하기

  //리뷰북마크취소하기

  //리뷰좋아요하기

  //리뷰좋아요취소하기

  //리뷰 공유하기

  //리뷰 신고하기

  //신고한 리뷰목록보기??

  //리뷰 차단하기

  @Get('/user/:userIdx/review/all')
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiQuery({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getReviewAllByuserIdx() {}

  @Get('/user/:userIdx/review/bookmark')
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiQuery({ name: 'userIdx', type: 'number' })
  @Exception(400, 'Invalid Request Query')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getBookmarkedReviewByuserIdx() {}

  @Get('/user/:userIdx/review/commented')
  @ApiOperation({ summary: '유저의 댓글단 리뷰목록보기' })
  @ApiQuery({ name: 'userIdx', type: 'number' })
  @Exception(400, 'Invalid Request Query')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getCommentAllByuserIdx() {}
}
