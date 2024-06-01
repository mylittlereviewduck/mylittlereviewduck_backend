import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CheckEmailDuplicateDto } from 'src/user/dto/check-email-duplicate.dto';
import { Exception } from 'src/decorator/exception.decorator';
import { CheckEmailDuplicateReponseDto } from 'src/user/dto/response/check-email-duplicate-response.dto';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/check-email')
  @ApiOperation({ summary: '이메일 중복확인' })
  @Exception(400, 'Invalid Request body')
  @Exception(409, '이메일 중복')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: CheckEmailDuplicateReponseDto })
  async checkEmailDulicate(@Body() checkDto: CheckEmailDuplicateDto) {}

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
