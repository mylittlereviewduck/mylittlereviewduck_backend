import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/guard/admin.guard';
import { OpinionPagerbleResponseDto } from 'src/opinion/dto/response/opinion-pagerble.response.dto';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { Exception } from 'src/common/decorator/exception.decorator';
import { OpinionService } from 'src/opinion/opinion.service';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly opinionService: OpinionService,
  ) {}

  @Get('/opinion/all')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '의견 목록 모두 보기(관리자용)',
    description: '관리자용 api입니다. (페이지네이션)',
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
}
