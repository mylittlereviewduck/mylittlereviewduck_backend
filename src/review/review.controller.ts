import { UserBlockCheckService } from './../user/user-block-check.service';
import { AwsService } from '../aws/aws.service';
import { ReviewBlockService } from './review-block.service';
import { ReviewBlockCheckService } from './review-block-check.service';
import { ReviewLikeService } from './like.service';
import {
  BadRequestException,
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
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewEntity } from './entity/Review.entity';
import { UploadReviewImageResponseDto } from './dto/response/upload-review-image-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewService } from './review.service';
import { LoginUser } from 'src/auth/model/login-user.model';
import { GetUser } from 'src/auth/get-user.decorator';
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
import { ReviewPagerbleDto } from './dto/review-pagerble.dto';
import { ReviewLikeCheckService } from './review-like-check.service';
import { SearchKeywordService } from '../user/search-keyword.service';
import { GetReviewsWithSearchDto } from './dto/get-review-with-search.dto';

@Controller('')
@ApiTags('review')
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly reviewLikeService: ReviewLikeService,
    private readonly reviewLikeCheckService: ReviewLikeCheckService,
    private readonly bookmarkService: BookmarkService,
    private readonly reviewBlockService: ReviewBlockService,
    private readonly reviewBlockCheckService: ReviewBlockCheckService,
    private readonly awsService: AwsService,
    private readonly userBlockCheckService: UserBlockCheckService,
    private readonly searchKeywordService: SearchKeywordService,
  ) {}

  @Get('/review/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '최신 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getLatestReviewAll(
    @GetUser() loginUser: LoginUser,
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getReviewsWithUserStatus({
      ...dto,
      loginUserIdx: loginUser && loginUser.idx,
    });
  }

  @Get('/review/hot')
  @ApiOperation({ summary: '좋아요 많이 받은 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getHotReview(
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getHotReviewAll(dto);
  }

  @Get('/review/cold')
  @ApiOperation({ summary: '싫어요 많이 받은 리뷰목록보기' })
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getColdReview(
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getColdReviewAll({
      size: dto.size,
      page: dto.page,
      timeframe: 'all',
    });
  }

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
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewEntity> {
    dto.userIdx = loginUser.idx;
    return await this.reviewService.createReview(dto);
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
    '유효하지않은 요청(파일 없는경우, 파일크기 초과한경우(10MB), 허용되는 확장자(jpg, jpeg, png, gif)가 아닌경우)',
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

  @Get('/review/:reviewIdx')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '리뷰 자세히보기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200, type: ReviewEntity })
  async getReviewDetail(
    @GetUser() loginUser: LoginUser,
    @Param('reviewIdx', ParseIntPipe) reviewIdx: number,
  ): Promise<ReviewEntity> {
    return await this.reviewService.getReviewDetail({
      ...(loginUser && { loginUserIdx: loginUser.idx }),
      reviewIdx,
    });
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
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewEntity> {
    dto.userIdx = loginUser.idx;
    dto.reviewIdx = reviewIdx;
    return await this.reviewService.updateReview(dto);
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
  ): Promise<void> {
    await this.reviewService.deleteReview(loginUser.idx, reviewIdx);
  }

  @Get('/review')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({
    summary: '리뷰검색하기 ',
    description: '작성자 닉네임, 태그, 제목, 내용으로 검색됩니다',
  })
  @ApiQuery({ name: 'search', description: '검색 키워드, 검색어 2글자 이상' })
  @Exception(400, '유효하지않은 요청')
  @Exception(404, 'Not Found Page')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto })
  async getSearchedReviewWithUserStatus(
    @GetUser() loginUser: LoginUser,
    @Query() dto: GetReviewsWithSearchDto,
  ): Promise<ReviewPagerbleResponseDto> {
    if (!loginUser) {
      return await this.reviewService.getReviewsWithSearch(dto);
    }

    return await this.reviewService.getSearchedReviewsWithUserStatus(
      loginUser.idx,
      dto,
    );
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

  @Post('/review/:reviewIdx/dislike')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '리뷰 싫어요하기' })
  @ApiParam({ name: 'reviewIdx', type: 'number', example: 1 })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
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
  @Exception(400, '유효하지않은 요청')
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
  @Exception(400, '유효하지않은 요청')
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
  @Exception(400, '유효하지않은 요청')
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
  // @Exception(400, '유효하지않은 요청')
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

  @Get('/review/all/following')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '팔로우한 사람들의 리뷰목록 보기' })
  @Exception(401, '권한없음')
  @ApiResponse({ status: 200 })
  async getReviewsByFollowingUsers(
    @GetUser() loginUser: LoginUser,
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getFollowingReviewsWithUserStatus({
      size: dto.size,
      page: dto.page,
      loginUserIdx: loginUser.idx,
    });
  }

  @Get('/user/:userIdx/review/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getReviewsAllByUserIdx(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getReviewsWithUserStatus({
      ...dto,
      userIdx,
      loginUserIdx: loginUser && loginUser.idx,
    });
  }

  @Get('/user/:userIdx/review/bookmark')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', description: '유저식별자' })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getBookmarkedReviews(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getBookmarkedReviewsWithUserStatus({
      size: dto.size,
      page: dto.page,
      loginUserIdx: loginUser && loginUser.idx,
      userIdx,
    });
  }

  @Get('/user/:userIdx/review/commented')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 댓글단 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getCommentedReviews(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getCommentedReviewsWithUserStatus({
      ...dto,
      userIdx: userIdx,
      loginUserIdx: loginUser && loginUser.idx,
    });
  }

  @Get('/user/:userIdx/review/like')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저의 좋아요한 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: ReviewPagerbleResponseDto, isArray: true })
  async getLikedReviews(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: ReviewPagerbleDto,
  ): Promise<ReviewPagerbleResponseDto> {
    return await this.reviewService.getLikedReviewsWithUserStatus({
      ...dto,
      userIdx: userIdx,
      loginUserIdx: loginUser && loginUser.idx,
    });
  }
}
