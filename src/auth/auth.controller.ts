import { Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor() {}

  //이메일인증
  //req body
  @Post('email')
  @ApiOperation({ summary: '이메일 인증', description: '' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async authEmail() {}

  //기본로그인
  //req body
  @Post('')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(200)
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async authUser() {}

  //소셜로그인
  @Post('/kakao')
  @ApiOperation({ summary: '카카오로그인' })
  async authKakao() {}
}
