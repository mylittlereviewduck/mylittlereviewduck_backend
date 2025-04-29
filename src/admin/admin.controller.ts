import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { OpinionPagerbleResponseDto } from 'src/opinion/dto/response/opinion-pagerble.response.dto';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { Exception } from 'src/common/decorator/exception.decorator';
import { OpinionService } from 'src/opinion/opinion.service';
import { SuspendUserDto } from 'src/user/dto/suspend-user.dto';
import { UserPagerbleResponseDto } from 'src/user/dto/response/user-pagerble-response.dto';
import { UserStatus } from 'src/user/type/user-status.type';
import { UserSuspensionService } from 'src/admin/user-suspension.service';
import { UserService } from 'src/user/user.service';
import { ReportPagerbleResponseDto } from 'src/report/dto/response/report-pagerble.response.dto';
import { ReportService } from 'src/report/report.service';
import { AnnouncementEntity } from './entity/Announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { LoginUser } from 'src/auth/model/login-user.model';
import { AnnouncementPagerbleResponseDto } from './dto/response/announcement-pagerble-response.dto';
import { GetAnnouncementsDto } from './dto/get-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly opinionService: OpinionService,
    private readonly reportService: ReportService,
    private readonly userSuspensionService: UserSuspensionService,
  ) {}

  @Post('/user/:userIdx/suspend')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '유저 정지하기',
    description: '관리자용 api',
  })
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiParam({
    name: 'userIdx',
    description: '유저idx',
    type: 'string',
    example: '836d533b-3ee3-4616-8644-a1ddea65e1e0',
  })
  @Exception(401, '권한 없음')
  @Exception(403, '관리자 권한 필요')
  @ApiResponse({ status: 200 })
  async suspendUser(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
    @Body() dto: SuspendUserDto,
  ) {
    return await this.userSuspensionService.suspendUser(userIdx, dto.timeframe);
  }

  @Delete('/user/:userIdx/suspend')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '유저 정지 해제하기',
    description: '관리자용 api',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userIdx',
    description: '유저idx',
    type: 'string',
    example: '836d533b-3ee3-4616-8644-a1ddea65e1e0',
  })
  @Exception(401, '권한 없음')
  @Exception(403, '관리자 권한 필요')
  @ApiResponse({ status: 200 })
  async deleteUserSuspension(
    @Param('userIdx', ParseUUIDPipe) userIdx: string,
  ): Promise<void> {
    await this.userSuspensionService.deleteUserSuspension(userIdx);
  }

  @Get('/user')
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: '특정 상태 유저목록 보기',
    description: `status 값이 주어지지 않으면 모든 유저목록을 불러옵니다. (최신가입 순)  
    관리자용 api
      `,
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'status',
    description:
      'active | suspended | blacklist 중 하나로 주시면 됩니다.(필수값X)',
    required: false,
  })
  @Exception(401, '권한 없음')
  @Exception(403, '관리자 권한 필요')
  @ApiResponse({ status: 200 })
  async getUsersWithStatus(
    @Query('status') status: UserStatus,
    @Query() dto: PagerbleDto,
  ): Promise<UserPagerbleResponseDto> {
    console.log('status: ', status);

    return await this.userService.getUsersAll({
      status,
      page: dto.page,
      size: dto.size,
    });
  }

  @Get('/report/all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '신고 목록 모두 보기',
    description: '관리자용 api',
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 200,
    description: '성공시 200 반환',
    type: ReportPagerbleResponseDto,
  })
  async getReportsAll(
    @Query() dto: PagerbleDto,
  ): Promise<ReportPagerbleResponseDto> {
    return await this.reportService.getReportsAll({
      size: dto.size,
      page: dto.page,
    });
  }

  @Get('/opinion/all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '의견 목록 모두 보기',
    description: '관리자용 api',
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 200,
    description: '성공시 200 반환',
    type: OpinionPagerbleResponseDto,
  })
  async getOpinionsAll(
    @Query() dto: PagerbleDto,
  ): Promise<OpinionPagerbleResponseDto> {
    return await this.opinionService.getOpinions({
      page: dto.page,
      size: dto.size,
    });
  }

  @Post('/announcement')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '공지사항 작성하기',
    description: `관리자용 api  
    category, status는 일단은 기본값으로 주세요 `,
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 201,
    description: '성공시 201 반환',
    type: AnnouncementEntity,
  })
  async writeAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<AnnouncementEntity> {
    return await this.adminService.createAnnouncement(dto, loginUser.idx);
  }

  @Get('/announcement')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '공지사항 목록보기',
    description: `관리자용 api  
    status값이 주어지지 않으면 모든 공지사항을 불러옵니다.  
    `,
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 200,
    description: '성공시 200 반환',
    type: AnnouncementPagerbleResponseDto,
  })
  async getAnnouncement(
    @Query() dto: GetAnnouncementsDto,
  ): Promise<AnnouncementPagerbleResponseDto> {
    return await this.adminService.getAnnounceMents(dto);
  }

  @Put('/announcement/:announcementIdx')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '공지사항 수정하기',
    description: `관리자용 api`,
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 404,
    description: '공지사항을 찾을 수 없음',
  })
  @ApiResponse({
    status: 200,
    description: '성공시 200 반환',
    type: AnnouncementEntity,
  })
  async modifyAnnouncement(
    @Param('announcementIdx', ParseIntPipe) announcementIdx: number,
    @Body() dto: UpdateAnnouncementDto,
    @GetUser() loginUser: LoginUser,
  ): Promise<AnnouncementEntity> {
    return await this.adminService.updateAnnouncement(
      dto,
      announcementIdx,
      loginUser.idx,
    );
  }

  @Delete('/announcement/:announcementIdx')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '공지사항 삭제하기',
    description: `관리자용 api`,
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 404,
    description: '공지사항을 찾을 수 없음',
  })
  @ApiResponse({
    status: 200,
    description: '성공시 200 반환',
  })
  async deleteAnnouncement(
    @Param('announcementIdx', ParseIntPipe) announcementIdx: number,
    @GetUser() loginUser: LoginUser,
  ): Promise<void> {
    return await this.adminService.deleteAnnouncement(
      announcementIdx,
      loginUser.idx,
    );
  }
}
