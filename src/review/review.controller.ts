import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
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
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201, description: '리뷰작성 성공시 201 반환' })
  async createReview(@Body() createReviewDto: CreateReviewDto) {}

  //리뷰수정하기
  @Put('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 수정하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  //이렇게써도되나?
  async updateReview(@Body() updateReviewDto: CreateReviewDto) {}

  //리뷰삭제하기
  @Delete('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 삭제하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  async deleteReview() {}

  //최신리뷰목록보기
  @Get('/review/all')
  @ApiOperation({ summary: '최신 리뷰목록보기' })
  async getReviewAll() {}

  //인기리뷰목록보기
  @Get('/review/popular')
  @ApiOperation({ summary: '인기 리뷰목록보기' })
  async getReviewPopular() {}

  //리뷰검색하기(태그, 제목, 내용, 닉네임)
  @Get('review/search')
  @ApiOperation({ summary: '리뷰검색하기 조건은??' })
  async getReviewWithSearch() {}

  //리뷰북마크하기
  @Post('/review/:reviewIdx/bookmark')
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 북마크하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  async bookmarkReview() {}

  //리뷰북마크취소하기
  @Delete('/review/:reviewIdx/bookmark')
  @ApiOperation({ summary: '리뷰 북마크해제하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  async unbookmarkReview() {}

  //리뷰좋아요하기
  @Post('/review/:reviewIdx/like')
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 좋아요하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  async likeReview() {}

  //리뷰좋아요취소하기
  @Delete('/review/:reviewIdx/like')
  @ApiOperation({ summary: '리뷰 좋아요해제하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  async unlikeReview() {}

  //리뷰 공유하기
  @Post('/review/:reviewIdx/share')
  @ApiOperation({ summary: '리뷰 공유하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  async shareReview() {}

  //리뷰 신고하기
  @Post('/review/:reviewIdx/report')
  @ApiOperation({ summary: '리뷰 신고하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')

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
