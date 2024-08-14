import { UserBlockCheckService } from './user-block-check.service';
import { UserBlockService } from './user-block.service';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { Exception } from '../../src/decorator/exception.decorator';
import { CheckNicknameDuplicateDto } from './dto/check-nickname-duplicate.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entity/User.entity';
import { UpdateMyInfoDto } from './dto/update-my-info.dto';
import { CheckEmailDuplicateDto } from './dto/check-email-duplicate.dto';
import { AuthGuard } from '../../src/auth/auth.guard';
import { GetUser } from '../../src/auth/get-user.decorator';
import { LoginUser } from '../../src/auth/model/login-user.model';
import { FollowService } from './follow.service';
import { FollowEntity } from './entity/Follow.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AwsService } from 'src/common/aws/aws.service';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';
import { FollowCheckService } from './follow-check.service';
import { UserBlockEntity } from './entity/UserBlock.entity';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
    private readonly followCheckService: FollowCheckService,
    private readonly userBlockService: UserBlockService,
    private readonly userBlockCheckService: UserBlockCheckService,
    private readonly awsService: AwsService,
  ) {}

  @Post('/check-email')
  @HttpCode(200)
  @ApiOperation({ summary: '이메일 중복검사' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이메일 중복')
  @Exception(500, '서버 에러')
  @ApiResponse({
    status: 200,
    description: '사용가능한 이메일일경우 상태코드 200반환',
  })
  async checkEmailDulicate(
    @Body() checkDto: CheckEmailDuplicateDto,
  ): Promise<void> {
    const user = await this.userService.getUser({ email: checkDto.email });

    if (user) {
      throw new ConflictException('Duplicated Email');
    }
  }

  @Post('/check-nickname')
  @HttpCode(200)
  @ApiOperation({ summary: '닉네임 중복검사' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '중복된 닉네임')
  @Exception(500, '서버 에러')
  @ApiResponse({
    status: 200,
    description: '사용가능한 닉네임일경우 상태코드 200반환',
  })
  async checkNicknameDuplicate(
    @Body() checkDto: CheckNicknameDuplicateDto,
  ): Promise<void> {
    const user = await this.userService.getUser({
      nickname: checkDto.nickname,
    });

    if (user) {
      throw new ConflictException('Duplicated Nickname');
    }
  }

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '유효하지않은 닉네임/이메일이거나 이미가입된 회원입니다')
  @Exception(500, '서버에러')
  @ApiResponse({ status: 201, type: UserEntity })
  async signUp(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.createUser(createUserDto);
  }

  @Get('myinfo')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '내정보보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity })
  async GetMyInfo(@GetUser() loginUser: LoginUser): Promise<UserEntity> {
    return await this.userService.getUser({ idx: loginUser.idx });
  }

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
  ): Promise<void> {
    await this.userService.updateMyinfo(loginUser.idx, {
      nickname: updateMyInfoDto.nickname,
      profile: updateMyInfoDto.profile,
    });
  }

  // @Post('profile-img')
  // @UseGuards(AuthGuard)
  // @ApiOperation({ summary: '프로필 이미지 업로드' })
  // @ApiBearerAuth()
  // @Exception(400, '유효하지않은 요청')
  // @Exception(401, '권한 없음')
  // @Exception(500, '서버 에러')
  // async uploadProfileImg(@GetUser() loginUser: LoginUser) {}

  @Put('profile-img')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '프로필 이미지 수정' })
  @ApiBearerAuth()
  @ApiBody({
    required: true,
    description: '프로필 이미지',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: '업로드할 이미지 파일',
        },
      },
    },
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async updateMyProfileImg(
    @GetUser() loginUser: LoginUser,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<void> {
    const imgPath = await this.awsService.uploadImageToS3(image);

    await this.userService.updateMyProfileImg(loginUser.idx, imgPath);
  }

  @Delete('profile-img')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async deleteMyProfileImg(@GetUser() loginUser: LoginUser): Promise<void> {
    await this.userService.deleteMyProfileImg(loginUser.idx);
  }

  @Get('/:userIdx/info')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저 정보 보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'number',
    example: 1,
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserEntity })
  async getUserInfo(
    @Param('userIdx') userIdx: string,
    @GetUser() loginUser: LoginUser,
  ): Promise<UserEntity> {
    const user = await this.userService.getUser({
      idx: userIdx,
    });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    if (!loginUser) {
      return user;
    }

    await this.followCheckService.isFollow(loginUser.idx, [user]);

    await this.userBlockCheckService.isBlocked(loginUser.idx, [user]);

    //유저신고, 유저신고여부확인기능은 논의하고 추가
    // await this.userReportCheckService.isReported(loginUser.idx, [user]);

    return user;
  }

  @Delete('')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '유저 탈퇴하기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200 })
  async deleteUser(@GetUser() loginUser: LoginUser): Promise<void> {
    await this.userService.deleteUser(loginUser.idx);
  }

  @Get('/:userIdx/following/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '팔로잉 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @ApiQuery({ name: 'page', example: 1, description: '페이지, 기본값 1' })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '페이지크기, 기본값 10',
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserPagerbleResponseDto })
  async getFollowingAll(
    @Param('userIdx') userIdx: string,
    @Query('page') page: number,
    @Query('size') size: number,
    @GetUser() loginUser: LoginUser,
  ): Promise<UserPagerbleResponseDto> {
    const userPagerbleResponseDto = await this.followService.getFollowingList({
      userIdx: userIdx,
      page: page || 1,
      size: size || 20,
    });

    if (!loginUser) {
      return userPagerbleResponseDto;
    }

    await this.followCheckService.isFollow(
      loginUser.idx,
      userPagerbleResponseDto.users,
    );

    return userPagerbleResponseDto;
  }

  @Get('/:userIdx/follower/all')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '팔로워 리스트보기' })
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @ApiQuery({ name: 'page', example: 1, description: '페이지, 기본값 1' })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '페이지크기, 기본값 10',
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserPagerbleResponseDto })
  async getFollowerAll(
    @Param('userIdx') userIdx: string,
    @Query('page') page: number,
    @Query('size') size: number,
    @GetUser() loginUser: LoginUser,
  ): Promise<UserPagerbleResponseDto> {
    const userPagerbleResponseDto = await this.followService.getFollowerList({
      userIdx: userIdx,
      page: page || 1,
      size: size || 20,
    });

    if (!loginUser) {
      return userPagerbleResponseDto;
    }

    await this.followCheckService.isFollow(
      loginUser.idx,
      userPagerbleResponseDto.users,
    );

    return userPagerbleResponseDto;
  }

  @Post('/:userIdx/follow')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '유저 팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({
    status: 200,
    description: '팔로우 성공 200 반환',
    type: FollowEntity,
  })
  async followUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseIntPipe) userIdx: string,
  ): Promise<FollowEntity> {
    return await this.followService.followUser(loginUser.idx, userIdx);
  }

  @Delete('/:userIdx/follow')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '유저 언팔로우' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '언팔로우 성공 200 반환' })
  async UnfollowUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseIntPipe) userIdx: string,
  ): Promise<void> {
    await this.followService.unfollowUser(loginUser.idx, userIdx);
  }

  @Post(':userIdx/block')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '유저 차단하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({
    status: 200,
    type: UserBlockEntity,
    description: '차단 성공 200 반환',
  })
  async blockUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx') userIdx: string,
  ): Promise<UserBlockEntity> {
    return await this.userBlockService.blockUser(loginUser.idx, userIdx);
  }

  @Delete(':userIdx/block')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '유저 차단해제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, description: '차단해제 성공 200 반환' })
  async UnblockUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx') userIdx: string,
  ): Promise<void> {
    await this.userBlockService.unBlockUser(loginUser.idx, userIdx);
  }

  @Get('blocked-user/all')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '차단한 유저목록보기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', type: 'number', example: 1 })
  @ApiQuery({ name: 'page', example: 1, description: '페이지, 기본값 1' })
  @ApiQuery({
    name: 'size',
    example: 10,
    description: '페이지크기, 기본값 10',
  })
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: UserPagerbleResponseDto })
  async getBlockedUserAll(
    @GetUser() loginUser: LoginUser,
    @Query('size') size: number,
    @Query('page') page: number,
  ): Promise<UserPagerbleResponseDto> {
    const userPagerbleResponseDto =
      await this.userBlockService.getBlockedUserAll(loginUser.idx, {
        page: page || 1,
        size: size || 10,
      });

    await this.followCheckService.isFollow(
      loginUser.idx,
      userPagerbleResponseDto.users,
    );

    //신고여부 신고기능 논의후 추가

    return userPagerbleResponseDto;
  }
}
