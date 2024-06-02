import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
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
  @Exception(400, '유효하지않은 요청')
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
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '중복된 닉네임')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async checkNicknameDuplicate() {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '유효하지않은 닉네임/이메일이거나 이미가입된 회원입니다')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 201 })
  async signUp() //인증된이메일 확인 //닉네임 중복확인
  // 이메일 중복확인?
  //인증된이메일 삭제
  {}

  @Get('myinfo')
  @ApiOperation({ summary: '내정보보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
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
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateMyInfo() {}

  @Put('profile-img')
  @ApiOperation({ summary: '프로필 이미지 수정' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateMyProfileImg() {}

  @Delete('profile-img')
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async deleteMyProfileImg() {}

  @Get('/info/:userIdx')
  @ApiOperation({ summary: '유저 정보 보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'number',
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getUserInfo() {}

  @Get('/:userIdx/following/all')
  @ApiOperation({ summary: '팔로잉 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getFollowingAll() {}

  @Get('/:userIdx/follower/all')
  @ApiOperation({ summary: '팔로워 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getFollowerAll() {}

  @Post('/:userIdx/follow')
  @ApiOperation({ summary: '유저 팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async followUser() {}

  @Delete('/:userIdx/follow')
  @ApiOperation({ summary: '유저 언팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async UnfollowUser() {}

  @Post(':userIdx/block')
  @ApiOperation({ summary: '유저 차단하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async blockUser() {}

  @Post(':userIdx/unblock')
  @ApiOperation({ summary: '유저 차단해제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async UnblockUser() {}

  @Get('blocked-user/all')
  @ApiOperation({ summary: '차단한 유저목록보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async getBlockedUserAll() {}
}
