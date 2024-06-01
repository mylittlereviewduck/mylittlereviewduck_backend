import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@Controller('review')
@ApiTags('review')
export class ReviewController {
  constructor() {}

  @Get('')
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiQuery({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Query' })
  @ApiInternalServerErrorResponse()
  async getReviewAllByuserIdx() {}

  @Get('/bookmark')
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiQuery({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Query' })
  @ApiInternalServerErrorResponse()
  async getBookmarkedReviewByuserIdx() {}

  @Get('/commented')
  @ApiOperation({ summary: '유저의 댓글목록보기' })
  @ApiQuery({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Query' })
  @ApiInternalServerErrorResponse()
  async getCommentAllByuserIdx() {}
}
