import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/check-email')
  @ApiOperation({
    summary: '이메일 중복확인',
    description: '이메일중복확인api',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string', description: 'email' } },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid Request body' })
  @ApiConflictResponse({ description: 'Duplicated Email' })
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  async checkEmailDulicate() {}

  @Post('check-nickname')
  @ApiOperation({ summary: '닉네임 중복검사' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { nickname: { type: 'string', description: 'nickname' } },
    },
  })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid request body' })
  @ApiConflictResponse({ description: 'Duplicated Nickname' })
  @ApiInternalServerErrorResponse()
  async checkNicknameDuplicate() {}

  @Get('myinfo')
  @ApiOperation({ summary: '내정보보기' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async GetMyInfo() {}

  @Put('myinfo')
  @ApiOperation({ summary: '내정보수정' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { nickname: { type: 'string' }, profile: { type: 'string' } },
    },
  })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Body' })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async updateMyInfo() {}

  @Put('profile-img')
  @ApiOperation({ summary: '프로필 이미지 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: '이미지 없음' })
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async updateMyProfileImg() {}

  @Delete('profile-img')
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async deleteMyProfileImg() {}

  @Get('/info/:userIdx')
  @ApiOperation({ summary: '유저 정보 보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'number',
  })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getUserInfo() {}

  @Get('/:userIdx/review/all')
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Param' })
  @ApiInternalServerErrorResponse()
  async getReviewAllByuserIdx() {}

  @Get('/:userIdx/bookmarked-review/all')
  @ApiOperation({ summary: '유저의 북마크한 리뷰목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Param' })
  @ApiInternalServerErrorResponse()
  async getBookmarkedReviewByuserIdx() {}

  @Get('/:userIdx/comment/all')
  @ApiOperation({ summary: '유저의 댓글목록보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Param' })
  @ApiInternalServerErrorResponse()
  async getCommentAllByuserIdx() {}

  @Get('/:userIdx/following/all')
  @ApiOperation({ summary: '팔로잉 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getFollowingAll() {}

  @Get('/:userIdx/follower/all')
  @ApiOperation({ summary: '팔로워 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getFollowerAll() {}

  @Post('/:userIdx/follow')
  @ApiOperation({ summary: '유저 팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async followUser() {}

  @Delete('/:userIdx/follow')
  @ApiOperation({ summary: '유저 언팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async UnfollowUser() {}

  @Post(':userIdx/block')
  @ApiOperation({ summary: '유저 차단하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async blockUser() {}

  @Post(':userIdx/unblock')
  @ApiOperation({ summary: '유저 차단해제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async UnblockUser() {}

  @Get('blocked-user/all')
  @ApiOperation({ summary: '차단한 유저목록보기' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async getBlockedUserAll() {}
}
