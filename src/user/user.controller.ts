import { UserStatus } from './type/user-status.type';
import { UserSuspensionService } from './user-suspension.service';
import { UserBlockCheckService } from './user-block-check.service';
import { UserBlockService } from './user-block.service';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
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
import { AuthGuard } from '../auth/guard/auth.guard';
import { GetUser } from '../../src/auth/get-user.decorator';
import { LoginUser } from '../../src/auth/model/login-user.model';
import { FollowService } from './follow.service';
import { FollowEntity } from './entity/Follow.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptionalAuthGuard } from 'src/auth/guard/optional-auth.guard';
import { UserPagerbleResponseDto } from './dto/response/user-pagerble-response.dto';
import { UserBlockEntity } from './entity/UserBlock.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AwsService } from 'src/aws/aws.service';
import { FileValidationPipe } from 'src/common/fileValidation.pipe';
import { UserListResponseDto } from './dto/response/user-list-response.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UserPagerbleDto } from './dto/user-pagerble.dto';
import { UserFollowService } from './user-follow.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly followService: FollowService,
    private readonly userFollowService: UserFollowService,
    private readonly userBlockService: UserBlockService,
    private readonly userBlockCheckService: UserBlockCheckService,
    private readonly awsService: AwsService,
    private readonly userSuspensionService: UserSuspensionService,
  ) {}

  @Post('/check-nickname')
  @HttpCode(200)
  @ApiOperation({ summary: '닉네임 중복검사' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '중복된 닉네임')
  @ApiResponse({
    status: 200,
    description: '사용가능한 닉네임일경우 상태코드 200반환',
  })
  async checkNicknameDuplicate(
    @Body() dto: CheckNicknameDuplicateDto,
  ): Promise<void> {
    const duplicatedUser = await this.userService.getUser({
      nickname: dto.nickname,
    });

    if (duplicatedUser && duplicatedUser.nickname == dto.nickname) {
      throw new ConflictException('Duplicated Nickname');
    }

    if (dto.nickname && dto.nickname.includes('번째 오리')) {
      throw new BadRequestException("Nickname can't include '번째 오리'");
    }
  }

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '유효하지않은 닉네임/이메일이거나 이미가입된 회원입니다')
  @ApiResponse({ status: 201, type: UserEntity })
  async signUp(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return await this.userService.createUser(createUserDto);
  }

  //논의후에 서비스로직 추가
  @Post('/pw/reset')
  @ApiOperation({ summary: '비밀번호 초기화 / 이메일 전송' })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200 })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<void> {
    return;
  }

  @Get('myinfo')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '내정보보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
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
  @ApiResponse({ status: 200 })
  async updateMyInfo(
    @GetUser() loginUser: LoginUser,
    @Body() dto: UpdateMyInfoDto,
  ): Promise<UserEntity> {
    if (dto.nickname && dto.nickname.includes('번째 오리')) {
      throw new BadRequestException("Nickname can't include '번째 오리'");
    }

    return await this.userService.updateMyinfo(loginUser.idx, dto);
  }

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
  @ApiResponse({ status: 200 })
  async updateMyProfileImg(
    @GetUser() loginUser: LoginUser,
    @UploadedFile(FileValidationPipe) image: Express.Multer.File,
  ): Promise<{ imgPath: string }> {
    const imgPath = await this.awsService.uploadImageToS3(image);

    await this.userService.updateMyProfileImg(loginUser.idx, imgPath, null);

    return { imgPath: imgPath };
  }

  @Delete('profile-img')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '프로필 이미지 삭제' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200 })
  async deleteMyProfileImg(@GetUser() loginUser: LoginUser): Promise<void> {
    await this.userService.updateMyProfileImg(loginUser.idx, null, null);
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
  @ApiResponse({ status: 200, type: UserEntity })
  async getUserInfo(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
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

    await this.userFollowService.isFollow(loginUser.idx, [user]);

    await this.userBlockCheckService.isBlockedUser(loginUser.idx, [user]);

    return user;
  }

  @Get('')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '유저검색하기 이메일, 닉네임, 관심사' })
  @ApiQuery({ name: 'search', description: '검색 키워드, 검색어 2글자 이상' })
  @Exception(400, '유효하지않은 요청')
  @Exception(404, 'Not Found Page')
  @ApiResponse({ status: 200, type: UserListResponseDto })
  async getUserWithSearch(
    @GetUser() loginUser: LoginUser,
    @Query('search') search: string,
    @Query() dto: UserPagerbleDto,
  ): Promise<UserListResponseDto> {
    if (search.length < 2) {
      throw new BadRequestException('검색어는 2글자이상');
    }

    const userSearchResponseDto = await this.userService.getUsersAll({
      email: search,
      nickname: search,
      interest1: search,
      interest2: search,
      size: dto.size || 10,
      page: dto.page || 1,
    });

    if (!loginUser) {
      return userSearchResponseDto;
    }

    await this.userFollowService.isFollow(
      loginUser.idx,
      userSearchResponseDto.users,
    );

    await this.userBlockCheckService.isBlockedUser(
      loginUser.idx,
      userSearchResponseDto.users,
    );

    return userSearchResponseDto;
  }

  @Delete('')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '유저 탈퇴하기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200 })
  async deleteUser(@GetUser() loginUser: LoginUser): Promise<void> {
    await this.userService.deleteUser(loginUser.idx);
  }

  @Get('/:userIdx/following/all')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: '팔로잉 리스트보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    example: '836d533b-3ee3-4616-8644-a1ddea65e1e0',
  })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: UserPagerbleResponseDto })
  async getFollowingAll(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: UserPagerbleDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<UserPagerbleResponseDto> {
    const { followingIdxs, totalCount } =
      await this.userFollowService.getFollowingUsersIdx({
        page: dto.page,
        size: dto.size,
        userIdx: userIdx,
      });

    const userPagerbleResponseDto = {
      totalPage: Math.ceil(totalCount / dto.size),
      users: await this.userService.getUsersByIdx(followingIdxs),
    };

    if (loginUser) {
      await this.userFollowService.isFollow(
        loginUser.idx,
        userPagerbleResponseDto.users,
      );
    }

    return userPagerbleResponseDto;
  }

  @Get('/:userIdx/follower/all')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: '팔로워 리스트보기' })
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    example: '836d533b-3ee3-4616-8644-a1ddea65e1e0',
  })
  @Exception(400, '유효하지않은 요청')
  @ApiResponse({ status: 200, type: UserPagerbleResponseDto })
  async getFollowerAll(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Query() dto: UserPagerbleDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<UserPagerbleResponseDto> {
    const { followerIdxs, totalCount } =
      await this.userFollowService.getFollowerUsersIdx({
        userIdx: userIdx,
        page: dto.page || 1,
        size: dto.size || 20,
      });

    const userPagerbleResponseDto = {
      totalPage: Math.ceil(totalCount / dto.size),
      users: await this.userService.getUsersByIdx(followerIdxs),
    };

    if (loginUser) {
      await this.userFollowService.isFollow(
        loginUser.idx,
        userPagerbleResponseDto.users,
      );
    }

    return userPagerbleResponseDto;
  }

  @Post('/:userIdx/follow')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '유저 팔로우' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userIdx',
    type: 'string',
    example: '836d533b-3ee3-4616-8644-a1ddea65e1e0',
  })
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 200,
    description: '팔로우 성공 200 반환',
    type: FollowEntity,
  })
  async followUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
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
  @ApiResponse({ status: 200, description: '언팔로우 성공 200 반환' })
  async UnfollowUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
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
  @ApiResponse({
    status: 200,
    type: UserBlockEntity,
    description: '차단 성공 200 반환',
  })
  async blockUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
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
  @ApiResponse({ status: 200, description: '차단해제 성공 200 반환' })
  async UnblockUser(
    @GetUser() loginUser: LoginUser,
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
  ): Promise<void> {
    await this.userBlockService.unBlockUser(loginUser.idx, userIdx);
  }

  @Get('blocked-user/all')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: '차단한 유저목록보기' })
  @ApiBearerAuth()
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200, type: UserPagerbleResponseDto })
  async getBlockedUserAll(
    @GetUser() loginUser: LoginUser,
    @Query() dto: UserPagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    const userPagerbleResponseDto =
      await this.userBlockService.getBlockedUserAll(loginUser.idx, {
        page: dto.page || 1,
        size: dto.size || 10,
      });

    await this.userFollowService.isFollow(
      loginUser.idx,
      userPagerbleResponseDto.users,
    );

    //신고여부 신고기능 논의후 추가

    return userPagerbleResponseDto;
  }

  @Post('/:userIdx/suspend')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '유저 정지하기' })
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiParam({ name: 'userIdx', description: '유저idx' })
  @Exception(401, '권한 없음')
  @Exception(403, '관리자 권한 필요')
  @ApiResponse({ status: 200 })
  async suspendUser(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Body() dto: SuspendUserDto,
  ) {
    dto.userIdx = userIdx;
    return await this.userSuspensionService.suspendUser(dto);
  }

  @Delete('/:userIdx/suspend')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '유저 정지 해제하기' })
  @ApiBearerAuth()
  @ApiParam({ name: 'userIdx', description: '유저idx' })
  @Exception(401, '권한 없음')
  @Exception(403, '관리자 권한 필요')
  @ApiResponse({ status: 200 })
  async deleteUserSuspension(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
  ): Promise<void> {
    await this.userSuspensionService.deleteUserSuspension(userIdx);
  }

  @Get('/status/:status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '특정 상태 유저목록 보기' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'status',
    description: '유저상태: active | suspended | blacklist',
  })
  @Exception(401, '권한 없음')
  @Exception(403, '관리자 권한 필요')
  @ApiResponse({ status: 200 })
  async getUsersWithStatus(
    @Param('status') status: UserStatus,
    @Query() dto: UserPagerbleDto,
  ): Promise<UserListResponseDto> {
    return await this.userService.getUsersAll({
      status,
      page: dto.page || 1,
      size: dto.size || 10,
    });
  }
}
