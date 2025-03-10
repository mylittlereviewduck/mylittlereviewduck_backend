import { OpinionPagerbleResponseDto } from './dto/response/opinion-pagerble.response.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OpinionService } from './opinion.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Exception } from 'src/common/decorator/exception.decorator';
import { OpinionEntity } from './entity/Opinion.entity';
import { LoginUser } from 'src/auth/model/login-user.model';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { UpsertOpinionDto } from './dto/upsert-opinion.dto';
import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { AdminGuard } from 'src/auth/guard/admin.guard';

@Controller('')
@ApiTags('opinion')
export class OpinionController {
  constructor(private readonly opinionService: OpinionService) {}

  @Post('/user/opinion')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '의견 남기기',
    description: '제목 150자, 내용 5000자 제한',
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 201,
    description: '의견남기기 성공 201 반환',
    type: OpinionEntity,
  })
  async createOpinion(
    @GetUser() loginUser: LoginUser,
    @Body() dto: UpsertOpinionDto,
  ): Promise<OpinionEntity> {
    return await this.opinionService.createOpinion(loginUser.idx, dto);
  }

  @Get('/user/my-opinion')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내가 남긴 의견 목록 가져오기',
    description: '내가 남긴 의견 목록 가져오기(페이지네이션)',
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 200,
    description: '성공시 200 반환',
    type: OpinionPagerbleResponseDto,
  })
  async getMyOpinions(
    @GetUser() loginUser: LoginUser,
    @Query() dto: PagerbleDto,
  ): Promise<OpinionPagerbleResponseDto> {
    return await this.opinionService.getOpinions({
      userIdx: loginUser.idx,
      page: dto.page,
      size: dto.size,
    });
  }

  @Put('/user/opinion/:opinionIdx')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '내 의견 수정하기',
    description: '제목 150자, 내용 5000자 제한',
  })
  @ApiParam({
    name: 'opinionIdx',
    description: '의견 식별자',
    type: 'number',
    example: '1',
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({
    status: 201,
    description: '의견남기기 성공 201 반환',
    type: OpinionEntity,
  })
  async updateMyOpinion(
    @GetUser() loginUser: LoginUser,
    @Param('opinionIdx', ParseIntPipe) opinionIdx: number,
    @Body() dto: UpsertOpinionDto,
  ): Promise<OpinionEntity> {
    return await this.opinionService.updateMyOpinion(
      loginUser.idx,
      opinionIdx,
      dto,
    );
  }
}
