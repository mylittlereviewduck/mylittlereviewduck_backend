import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
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
import { OpinionService } from './opinion.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Exception } from 'src/common/decorator/exception.decorator';
import { OpinionEntity } from './entity/Opinion.entity';
import { LoginUser } from 'src/auth/model/login-user.model';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { UpsertOpinionDto } from './dto/upsert-opinion.dto';

@Controller('user')
@ApiTags('opinion')
export class OpinionController {
  constructor(private readonly opinionService: OpinionService) {}

  @Post('/opinion')
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

  @Put('/opinion/:opinionIdx')
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
