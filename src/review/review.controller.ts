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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { CreateReviewDto } from './dto/CreateReview.dto';
import { ReviewEntity } from './entity/Review.entity';
import { UploadReviewImageResponseDto } from './dto/response/UploadReviewImageResponse.dto';
import { UpdateReviewDto } from './dto/UpdateReview.dto';
import { ReviewService } from './review.service';
import { RedisService } from 'src/common/redis/redis.service';

@Controller('')
@ApiTags('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly redisService: RedisService,
  ) {}

  @Post('/review')
  @ApiOperation({ summary: '리뷰 작성하기' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201, description: '리뷰작성 성공시 201 반환' })
  async createReview(
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    return await this.reviewService.createReview({}, createReviewDto);
  }

  @Post('/review')
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 이미지업로드' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한없음')
  @Exception(500, '서버 에러')
  @ApiResponse({
    status: 200,
    description: '리뷰 이미지 업로드 성공시 200반환',
    type: UploadReviewImageResponseDto,
  })
  async uploadReviewImage() {}

  @Get('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 자세히보기' })
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async getReviewIdx() {}

  @Put('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 수정하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200 })
  async updateReview(@Body() updateReviewDto: UpdateReviewDto) {}

  @Delete('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 삭제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', example: 3 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200 })
  async deleteReview() {}

  @Get('/review/all')
  @ApiOperation({ summary: '최신 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewEntity, isArray: true })
  async getReviewAll() {}

  @Get('/review/popular')
  @ApiOperation({ summary: '인기 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewEntity, isArray: true })
  async getReviewPopular() {}

  @Get('review/search')
  @ApiOperation({ summary: '리뷰검색하기 닉네임, 태그, 제목,내용' })
  @ApiResponse({ status: 200, type: ReviewEntity, isArray: true })
  async getReviewWithSearch(): Promise<ReviewEntity[]> {
    const hotReviewString: string = await this.redisService.get('hot-review');

    if (hotReviewString) {
      return JSON.parse(hotReviewString);
    }

    const reviews = await this.reviewService.getHotReviewAll();
    await this.redisService.set('hot-review', JSON.stringify(reviews));

    return reviews;
  }

  @Post('/review/:reviewIdx/bookmark')
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 북마크하기' })
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async bookmarkReview() {}

  @Delete('/review/:reviewIdx/bookmark')
  @ApiOperation({ summary: '리뷰 북마크해제하기' })
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async unbookmarkReview() {}

  @Post('/review/:reviewIdx/like')
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 좋아요하기' })
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async likeReview() {}

  @Delete('/review/:reviewIdx/like')
  @ApiOperation({ summary: '리뷰 좋아요해제하기' })
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async unlikeReview() {}

  @Get('/user/:userIdx/review/all')
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: ReviewEntity, isArray: true })
  async getReviewAllByuserIdx() {}

  @Get('/user/:userIdx/review/bookmark')
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', example: 1 })
  @Exception(400, 'Invalid Request Query')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: ReviewEntity, isArray: true })
  async getBookmarkedReviewByuserIdx() {}

  @Get('/user/:userIdx/review/commented')
  @ApiOperation({ summary: '유저의 댓글단 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', example: 1 })
  @Exception(400, 'Invalid Request Query')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: ReviewEntity, isArray: true })
  async getCommentAllByuserIdx() {}

  //리뷰신고하기
}
