import { Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { SendEmailWithVerificationDto } from './dto/response/sendEmailWithVerificationDto';
import { EmailVerifyResponseDto } from './dto/response/EmailVerifyResponseDto';
import { SignInDto } from './dto/SignInDto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor() {}

  //이메일 인증번호전송
  @Post('/email/send')
  @ApiOperation({ summary: '이메일 인증 전송' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: SendEmailWithVerificationDto })
  async sendEmailWithVerification() {}

  //이메일 인증번호확인
  //req body
  @Post('email/verify')
  @ApiOperation({ summary: '이메일 인증확인' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이미 인증된 이메일')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: EmailVerifyResponseDto })
  async authEmail() {
    //true면 이메일 db저장
  }

  //기본로그인
  //req body
  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: SignInDto })
  async authUser() {}

  //소셜로그인
  @Post('/kakao')
  @ApiOperation({ summary: '카카오로그인' })
  async authKakao() {}
}
