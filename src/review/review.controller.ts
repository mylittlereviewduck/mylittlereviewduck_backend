import { AwsService } from '../aws/aws.service';
import { ReviewBlockService } from './review-block.service';
import { ReviewLikeService } from './like.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { CreateReviewDto } from './dto/request/create-review.dto';
import { ReviewEntity } from './entity/Review.entity';
import { UploadReviewImageResponseDto } from './dto/response/upload-review-image-response.dto';
import { UpdateReviewDto } from './dto/request/update-review.dto';
import { ReviewService } from './review.service';
import { LoginUser } from 'src/auth/model/login-user.model';
import { GetUser } from 'src/decorator/get-user.decorator';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { OptionalAuthGuard } from 'src/auth/guard/optional-auth.guard';
import { ReviewPagerbleResponseDto } from './dto/response/review-pagerble-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'src/common/fileValidation.pipe';
import { ReviewLikeEntity } from './entity/ReviewLike.entity';
import { ReviewDislikeEntity } from './entity/ReviewDislike.entity';
import { ReviewBlockEntity } from './entity/ReviewBlock.entity';
import { ReviewBookmarkEntity } from './entity/Reviewbookmark.entity';
import { BookmarkService } from './bookmark.service';
import { GetReviewsWithSearchDto } from './dto/request/get-review-with-search.dto';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { HotReviewPagerbleDto } from './dto/request/hot-review-pagerble.dto';

@Controller('')
@ApiTags('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly reviewLikeService: ReviewLikeService,
    private readonly bookmarkService: BookmarkService,
    private readonly reviewBlockService: ReviewBlockService,
    private readonly awsService: AwsService,
  ) {}

  @Get('/user/:userIdx/review/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    description: '유저식별자',
    example: '5b7459f9-1ec4-4529-b855-6146306a1973',
  })
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getReviewsAllByUserIdx(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getReviewsByUserIdxWithInteraction(
      {
        ...dto,
        userIdx,
      },
      loginUser && loginUser.idx,
    );
  }

  @Get('/user/:userIdx/review/bookmark')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    description: '유저식별자',
    example: '5b7459f9-1ec4-4529-b855-6146306a1973',
  })
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getBookmarkedReviews(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getBookmarkedReviewsWithInteraction(
      {
        size: dto.size,
        page: dto.page,
        userIdx,
      },
      loginUser && loginUser.idx,
    );
  }

  @Get('/user/:userIdx/review/commented')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 댓글단 리뷰목록보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    description: '유저식별자',
    example: '5b7459f9-1ec4-4529-b855-6146306a1973',
  })
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getCommentedReviews(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getCommentedReviewsWithInteraction(
      {
        ...dto,
        userIdx: userIdx,
      },
      loginUser && loginUser.idx,
    );
  }

  @Get('/user/:userIdx/review/like')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 좋아요한 리뷰목록보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    description: '유저식별자',
    example: '5b7459f9-1ec4-4529-b855-6146306a1973',
  })
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getLikedReviews(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getLikedReviewsWithInteraction(
      {
        ...dto,
        userIdx: userIdx,
      },
      loginUser && loginUser.idx,
    );
  }

  @Get('/review/high-score/following')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: ' 평점 3-5점의 덕질중인 리뷰 목록 보기' })
  @Exception(401, '권한없음')
  @ApiResponse({ status: 200 })
  async getHighScoreByFollowingUsers(
    @GetUser() loginUser: LoginUser,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getFollowingReviewsWithInteraction(
      {
        size: dto.size,
        page: dto.page,
        scoreGte: 3,
      },
      loginUser.idx,
    );
  }

  @Get('/review/high-score/hot')
  @ApiOperation({ summary: '평점 3-5점의 인기리뷰 보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getHotReviewsHighScoreWithInteraction(
    @Query() dto: HotReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getCachedHotReviewsHighScore(dto);
  }

  @Get('/review/high-score')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '평점 3-5점의 최신 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getLatestReviewsHighScore(
    @GetUser() loginUser: LoginUser,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getScoreReviewsWithInteraction(
      {
        ...dto,
        scoreGte: 3,
      },
      loginUser && loginUser.idx,
    );
  }

  @Get('/review/low-score/following')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: ' 평점 0-2점의 덕질중인 리뷰 목록 보기' })
  @Exception(401, '권한없음')
  @ApiResponse({ status: 200 })
  async getLowScoreReviewsByFollowingUsers(
    @GetUser() loginUser: LoginUser,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getFollowingReviewsWithInteraction(
      {
        size: dto.size,
        page: dto.page,
        scoreLte: 2,
      },
      loginUser.idx,
    );
  }

  @Get('/review/low-score/hot')
  @ApiOperation({ summary: '평점 0-2점의 인기리뷰 보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getHotReviewsLowScoreWithInteraction(
    @Query() dto: HotReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getCachedHotReviewsLowScore(dto);
  }

  @Get('/review/low-score')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '평점 0-2점의 최신 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getLatestReviewsLowScore(
    @GetUser() loginUser: LoginUser,
    @Query() dto: PagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getScoreReviewsWithInteraction(
      {
        ...dto,
        scoreLte: 2,
      },
      loginUser && loginUser.idx,
    );
  }

  @Post('/review/:reviewIdx/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 좋아요하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201, type: ReviewLikeEntity })
  async likeReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewLikeEntity> {
    return await this.reviewLikeService.likeReview(loginUser.idx, reviewIdx);
  }

  @Delete('/review/:reviewIdx/like')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 좋아요해제하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
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

  @Post('/review/:reviewIdx/dislike')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 싫어요하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201, type: ReviewDislikeEntity })
  async dislikeReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewDislikeEntity> {
    return await this.reviewLikeService.dislikeReview(loginUser.idx, reviewIdx);
  }

  @Delete('/review/:reviewIdx/dislike')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 싫어요 해제하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201 })
  async undislikeReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewLikeService.undislikeReview(loginUser.idx, reviewIdx);
  }

  @Post('/review/:reviewIdx/bookmark')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 북마크하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 201, type: ReviewBookmarkEntity })
  async bookmarkReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewBookmarkEntity> {
    return await this.bookmarkService.bookmarkReview(loginUser.idx, reviewIdx);
  }

  @Delete('/review/:reviewIdx/bookmark')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 북마크해제하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 찾을수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200 })
  async unbookmarkReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.bookmarkService.unbookmarkReview(loginUser.idx, reviewIdx);
  }

  // @Post('/review/:reviewIdx/share')
  // @UseGuards(AuthGuard)
  // @ApiOperation({ summary: '리뷰 공유하기' })
  // @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  // @ApiBearerAuth()
  // @Exception(400, '유효하지 않은 요청')
  // @Exception(401, '권한 없음')
  // @Exception(404, '해당 리소스 찾을수 없음')
  // @Exception(409, '현재상태와 요청 충돌')
  // @ApiResponse({ status: 201, type: ReviewShareEntity })
  // async shareReview(
  //   @GetUser() loginUser: LoginUser,
  //   @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  // ): Promise<ReviewShareEntity> {
  //   return await this.reviewShareService.shareReview(loginUser.idx, reviewIdx);
  // }

  @Post('/review/:reviewIdx/block')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 차단하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은요청')
  @Exception(401, '권한없음')
  @Exception(404, '해당리소스 찾을 수 없음')
  @Exception(409, '현재상태와 요청 충돌')
  @ApiResponse({ status: 200, type: ReviewBlockEntity })
  async blockReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewBlockEntity> {
    return await this.reviewBlockService.blockReview(loginUser.idx, reviewIdx);
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

  @Get('/review/:reviewIdx')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '리뷰 자세히보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async getReviewDetail(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewEntity> {
    return await this.reviewService.getReviewDetail(
      reviewIdx,
      loginUser && loginUser.idx,
    );
  }

  @Put('/review/:reviewIdx')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 수정하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async updateReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    dto.reviewIdx = reviewIdx;
    return await this.reviewService.updateReview(dto, loginUser.idx);
  }

  @Delete('/review/:reviewIdx')
  @ApiOperation({ summary: '리뷰 삭제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 3 })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @Exception(404, '해당 리소스 없음')
  @ApiResponse({ status: 200 })
  async deleteReview(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<void> {
    await this.reviewService.deleteReview(loginUser.idx, reviewIdx);
  }

  @Post('/review/image')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '리뷰 이미지업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    required: true,
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일(jpg, jpeg, png, gif)',
        },
      },
    },
  })
  @Exception(
    400,
    '유효하지 않은 요청(파일 없는경우, 파일크기 초과한경우(10MB), 허용되는 확장자(jpg, jpeg, png, gif)가 아닌경우)',
  )
  @Exception(401, '권한없음')
  @ApiResponse({
    status: 201,
    description: '리뷰 이미지 업로드 성공시 201반환',
    type: UploadReviewImageResponseDto,
  })
  async uploadReviewImage(
    @UploadedFile(FileValidationPipe) image: Express.Multer.File,
  ): Promise<UploadReviewImageResponseDto> {
    console.log(image);
    return { imgPath: await this.awsService.uploadImageToS3(image) };
  }

  @Post('/review')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 작성하기' })
  @ApiBearerAuth()
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 201,
    type: ReviewEntity,
    description: '리뷰작성 성공시 201 반환',
  })
  async createReview(
    @GetUser() loginUser: LoginUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    dto.userIdx = loginUser.idx;
    return await this.reviewService.createReview(dto);
  }

  @Get('/review')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: '리뷰검색하기 ',
    description: '작성자 닉네임, 태그, 제목, 내용으로 검색됩니다',
  })
  @ApiQuery({ name: 'search', description: '검색 키워드, 검색어 2글자 이상' })
  @Exception(400, '유효하지 않은 요청')
  @Exception(404, 'Not Found Page')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getSearchedReviewWithUserStatus(
    @GetUser() loginUser: LoginUser,
    @Query() dto: GetReviewsWithSearchDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getSearchedReviewsWithUserStatus(
      dto,
      loginUser && loginUser.idx,
    );
  }
}
