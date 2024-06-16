import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entity/Review.entity';
import { UploadReviewImageResponseDto } from './dto/response/upload-review-image-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { LoginUser } from 'src/auth/model/login-user.model';
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('')
@ApiTags('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('/review')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 작성하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 201, description: '리뷰작성 성공시 201 반환' })
  async createReview(
    @GetUser() loginUser: LoginUser,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<{ data: ReviewEntity }> {
    const review = await this.reviewService.createReview(
      loginUser,
      createReviewDto,
    );

    return { data: review };
  }

  //멀터생성하기
  //멀터 정리하기
  @Post('/review/img')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '리뷰 이미지업로드' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한없음')
  @Exception(500, '서버 에러')
  @ApiResponse({
    status: 200,
    description: '리뷰 이미지 업로드 성공시 200반환',
    type: UploadReviewImageResponseDto,
  })
  async uploadReviewImage(): Promise<{ imgPath: string }> {
    return;
  }

  //getReview생성하기
  @Get('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 자세히보기' })
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async getReviewIdx() {}

  @Put('/review/:reviewIdx')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 수정하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 200 })
  async updateReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx') reviewIdx: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<{ data: ReviewEntity }> {
    //작업 시작해야할 부분
    const review = await this.reviewService.updateReview(loginUser, {});
    return;
  }

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
    // const hotReviewString: string = await this.cacheManager.get('hot-review');

    // if (hotReviewString) {
    //   return JSON.parse(hotReviewString);
    // }

    const reviews = await this.reviewService.getHotReviewAll();
    // await this.redisService.set('hot-review', JSON.stringify(reviews));

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
