import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Exception } from 'src/decorator/exception.decorator';
import { CheckNicknameDuplicateDto } from './dto/CheckNicknameDuplicate.dto';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UserEntity } from './entity/User.entity';
import { UpdateMyInfoDto } from './dto/UpdateMyInfo.dto';
import { UpdateMyProfileImgDto } from './dto/UpdateMyProfileImg.dto';
import { CheckEmailDuplicateDto } from './dto/CheckEmailDuplicate.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/email/check')
  @HttpCode(200)
  @ApiOperation({ summary: '이메일 중복확인' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이메일 중복')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '사용가능한 이메일일경우 200반환' })
  async checkEmailDulicate(@Body() checkDto: CheckEmailDuplicateDto) {}

  @Post('/nickname/check')
  @HttpCode(200)
  @ApiOperation({ summary: '닉네임 중복검사' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '중복된 닉네임')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '사용가능한 닉네임일경우 200반환' })
  async checkNicknameDuplicate(@Body() checkDto: CheckNicknameDuplicateDto) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '유효하지않은 닉네임/이메일이거나 이미가입된 회원입니다')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 201 })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Get('myinfo')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '내정보보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity })
  async GetMyInfo(@GetUser() loginUser: LoginUser) {}

  @Put('myinfo')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '내정보수정' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateMyInfo(
    @GetUser() loginUser: LoginUser,
    @Body() updateMyInfoDto: UpdateMyInfoDto,
  ) {}

  @Put('profile-img')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '프로필 이미지 수정' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateMyProfileImg(
    @GetUser() loginUser: LoginUser,
    @Body() updateMyProfileImgDto: UpdateMyProfileImgDto,
  ) {}

  @Post('profile-img')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '프로필 이미지 업로드' })
  @ApiBearerAuth()
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  async uploadProfileImg(@GetUser() loginUser: LoginUser) {}

  @Delete('profile-img')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async deleteMyProfileImg(@GetUser() loginUser: LoginUser) {}

  @Get('/info/:userIdx')
  @ApiOperation({ summary: '유저 정보 보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'number',
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity })
  async getUserInfo() {}

  @Delete('')
  @ApiOperation({ summary: '유저 탈퇴하기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  async deleteUser(): Promise<void> {}

  //?? 팔로우여부가 포함된 유저를 response할때, 어떻게dto를 만들어야할까?
  @Get('/:userIdx/following/all')
  @ApiOperation({ summary: '팔로잉 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity, isArray: true })
  async getFollowingAll() {}

  @Get('/:userIdx/follower/all')
  @ApiOperation({ summary: '팔로워 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity, isArray: true })
  async getFollowerAll() {}

  @Post('/:userIdx/follow')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '유저 팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '팔로우 성공 200 반환' })
  async followUser(@GetUser() loginUser: LoginUser) {}

  @Delete('/:userIdx/follow')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '유저 언팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '언팔로우 성공 200 반환' })
  async UnfollowUser(@GetUser() loginUser: LoginUser) {}

  @Post(':userIdx/block')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '유저 차단하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '차단 성공 200 반환' })
  async blockUser(@GetUser() loginUser: LoginUser) {}

  @Delete(':userIdx/block')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '유저 차단해제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number' })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '차단해제 성공 200 반환' })
  async UnblockUser(@GetUser() loginUser: LoginUser) {}

  @Get('blocked-user/all')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '차단한 유저목록보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity, isArray: true })
  async getBlockedUserAll(@GetUser() loginUser: LoginUser) {}
}
