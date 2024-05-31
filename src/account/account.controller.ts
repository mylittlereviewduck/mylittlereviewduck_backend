import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
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
import { AccountService } from './account.service';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

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

  @Get('/info/:accountIdx')
  @ApiOperation({ summary: '유저 정보 보기' })
  @ApiParam({
    name: 'accountIdx',
    type: 'number',
  })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async getUserInfo() {}

  //유저가 쓴 리뷰목록보기
  @Get('/:accountIdx/review')
  @ApiOperation({ summary: '유저가 쓴 리뷰목록보기' })
  @ApiQuery({ name: 'accountidx', type: 'number' })
  @ApiOkResponse()
  @ApiBadRequestResponse({ description: 'Invalid Request Query' })
  @ApiInternalServerErrorResponse()
  async getReviewListByAccountIdx() {}

  //유저가쓴 댓글목록보기

  //북마크한 리뷰 목록보기
}
