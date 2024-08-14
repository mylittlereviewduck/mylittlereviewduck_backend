import { AwsService } from './../common/aws/aws.service';
import { ReviewShareCheckService } from './review-share-check.service';
import { ReviewShareService } from './review-share.service';
import { ReviewBlockService } from './review-block.service';
import { ReviewBlockCheckService } from './review-block-check.service';
import { ReviewBookmarkCheckService } from './review-bookmark-check.service';
import { ReviewLikeService } from './review-like.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
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
import { ReviewSearchResponseDto } from './dto/response/review-search-response.dto';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { ReviewLikeCheckService } from './review-like-check.service';
import { ReviewBookmarkService } from './review-bookmark.service';
import { ReviewReportService } from './review-report.service';
import { ParseStringPipe } from '../common/parseString.pipe';

@Controller('')
@ApiTags('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly reviewLikeService: ReviewLikeService,
    private readonly reviewLikeCheckService: ReviewLikeCheckService,
    private readonly reviewBookmarkService: ReviewBookmarkService,
    private readonly reviewBookmarkCheckService: ReviewBookmarkCheckService,
    private readonly reviewShareService: ReviewShareService,
    private readonly reviewShareCheckService: ReviewShareCheckService,
    private readonly reviewBlockService: ReviewBlockService,
    private readonly reviewBlockCheckService: ReviewBlockCheckService,
    private readonly reviewReportService: ReviewReportService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly awsService: AwsService,
  ) {}

  @Get('/review/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '최신 리뷰목록보기' })
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
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getReviewAll(
    @GetUser() loginUser: LoginUser,
    @Query('page', ParseIntPipe) page: number,
    @Query('size', ParseIntPipe) size: number,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto = await this.reviewService.getReviews({
      size: size || 10,
      page: page || 1,
    });

    if (!loginUser) {
      return reviewPagerbleResponseDto;
    }

    await this.reviewLikeCheckService.isReviewLiked(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    await this.reviewBookmarkCheckService.isReviewBookmarked(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    await this.reviewBlockCheckService.isReviewBlocked(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    await this.reviewShareCheckService.isReviewShared(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    return reviewPagerbleResponseDto;
  }

  @Get('/review/popular')
  @ApiOperation({ summary: '인기 리뷰목록보기' })
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
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getReviewPopular() {}

  @Post('/review')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 작성하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 201,
    type: ReviewEntity,
    description: '리뷰작성 성공시 201 반환',
  })
  async createReview(
    @GetUser() loginUser: LoginUser,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    return await this.reviewService.createReview(loginUser, createReviewDto);
  }

  //멀터생성하기
  //멀터 정리하기
  @Post('/review/img')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 이미지업로드' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한없음')
  @ApiResponse({
    status: 201,
    description: '리뷰 이미지 업로드 성공시 201반환',
    type: UploadReviewImageResponseDto,
  })
  async uploadReviewImage(): Promise<{ imgPath: string }> {
    //리뷰당 이미지 6개 제한

    // await this.awsService.uploadImageToS3(, )

    return;
  }

  //getReview생성하기
  @Get('/review/:reviewIdx')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '리뷰 자세히보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async getReviewWithIdx(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewEntity> {
    const reviewEntity = await this.reviewService.getReviewByIdx(reviewIdx);

    if (!loginUser) {
      return reviewEntity;
    }

    await this.reviewLikeCheckService.isReviewLiked(loginUser.idx, [
      reviewEntity,
    ]);

    await this.reviewBookmarkCheckService.isReviewBookmarked(loginUser.idx, [
      reviewEntity,
    ]);

    await this.reviewBlockCheckService.isReviewBlocked(loginUser.idx, [
      reviewEntity,
    ]);

    await this.reviewShareCheckService.isReviewShared(loginUser.idx, [
      reviewEntity,
    ]);

    return reviewEntity;
  }

  @Put('/review/:reviewIdx')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 수정하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async updateReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    return await this.reviewService.updateReview(
      loginUser,
      reviewIdx,
      updateReviewDto,
    );
  }

  @Delete('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 삭제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 3 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200 })
  async deleteReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewEntity> {
    const reviewEntity = await this.reviewService.deleteReview(
      loginUser,
      reviewIdx,
    );
    return reviewEntity;
  }

  @Get('/review')
  @ApiOperation({ summary: '리뷰검색하기 닉네임, 태그, 제목,내용' })
  @ApiQuery({ name: 'search', description: '검색 키워드' })
  @ApiQuery({
    name: 'size',
    example: 1,
    description: '한 페이지당 가져올 리뷰수, 기본값 10',
  })
  @ApiQuery({
    name: 'page',
    example: 1,
    description: '가져올 페이지, 기본값 1',
  })
  @Exception(404, 'Not Found Page')
  @ApiResponse({ status: 200, type: ReviewSearchResponseDto })
  async getReviewWithSearch(
    @Query('search') search: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<ReviewSearchResponseDto> {
    if (search.length < 2) {
      throw new BadRequestException('Bad Request: 검색어는 2글자이상');
    }

    return await this.reviewService.getReviewWithSearch({
      search: search,
      size: size || 10,
      page: page || 1,
    });
  }

  @Post('/review/:reviewIdx/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 좋아요하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201 })
  async likeReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewLikeService.likeReview(loginUser.idx, reviewIdx);
  }

  @Delete('/review/:reviewIdx/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 좋아요해제하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200 })
  async unlikeReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewLikeService.unlikeReview(loginUser.idx, reviewIdx);
  }

  @Post('/review/:reviewIdx/bookmark')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 북마크하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201 })
  async bookmarkReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewBookmarkService.bookmarkReview(loginUser.idx, reviewIdx);
  }

  @Delete('/review/:reviewIdx/bookmark')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 북마크해제하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200 })
  async unbookmarkReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewBookmarkService.unbookmarkReview(loginUser.idx, reviewIdx);
  }

  @Post('/review/:reviewIdx/share')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 공유하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201 })
  async shareReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewShareService.shareReview(loginUser.idx, reviewIdx);
  }

  @Post('/review/:reviewIdx/block')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 차단하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200 })
  async blockReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewBlockService.blockReview(loginUser.idx, reviewIdx);
  }

  @Delete('/review/:reviewIdx/block')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 차단해제하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200 })
  async unblockReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewBlockService.unblockReview(loginUser.idx, reviewIdx);
  }

  //데이터 추가될 수 있음
  @Post('/review/:reviewIdx/report')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 신고하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200 })
  async reportReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewReportService.reportReview(loginUser.idx, reviewIdx);
  }

  @Get('/user/:userIdx/review/all')
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '한 페이지에 가져올 리뷰수, 기본값 10',
  })
  @ApiQuery({
    name: 'page',
    example: 1,
    description: '가져올 페이지, 기본값 1',
  })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getReviewAllByuserIdx(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getReviews(
      {
        page: page || 1,
        size: size || 10,
      },
      userIdx,
    );
  }

  @Get('/user/:userIdx/review/bookmark')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '한 페이지에 가져올 리뷰수, 기본값 10',
  })
  @ApiQuery({
    name: 'page',
    example: 1,
    description: '가져올 페이지, 기본값 1',
  })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getBookmarkedReviewByuserIdx(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query('size') size: number,
    @Query('page') page: number,
  ): Promise<ReviewPagerbleResponseDto> {
    const reviewPagerbleResponseDto =
      await this.reviewService.getBookmarkedReviewAll(userIdx, {
        size: size || 10,
        page: page || 1,
      });

    if (!loginUser) {
      return reviewPagerbleResponseDto;
    }

    await this.reviewLikeCheckService.isReviewLiked(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    await this.reviewBookmarkCheckService.isReviewBookmarked(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    await this.reviewShareCheckService.isReviewShared(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    await this.reviewBlockCheckService.isReviewBlocked(
      loginUser.idx,
      reviewPagerbleResponseDto.reviews,
    );

    return reviewPagerbleResponseDto;
  }

  @Get('/user/:userIdx/review/commented')
  @ApiOperation({ summary: '유저의 댓글단 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '한 페이지에 가져올 리뷰수, 기본값 10',
  })
  @ApiQuery({
    name: 'page',
    example: 1,
    description: '가져올 페이지, 기본값 1',
  })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getReviewCommented(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getReviewCommented(
      {
        size: size || 10,
        page: page || 1,
      },
      userIdx,
    );
  }
}
