import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { SendEmailWithVerificationResponseDto } from './dto/response/SendEmailWithVerificationResponseDto';
import { VerifyEmailResponseDto } from './dto/response/VerifyEmailResponseDto';
import { SignInDto } from './dto/SignInDto';
import { VerifyEmailDto } from './dto/VerifyEmailDto';
import { SendEmailWithVerificationDto } from './dto/SendEmailWithVerificationDto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor() {}

  //이메일 인증번호전송
  @Post('/email/send')
  @ApiOperation({ summary: '이메일 인증 전송' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: SendEmailWithVerificationResponseDto })
  async sendEmailWithVerification(
    @Body() sendEmailWithVerificationDto: SendEmailWithVerificationDto,
  ) {}

  //이메일 인증번호확인
  //req body
  @Post('email/verify')
  @ApiOperation({ summary: '이메일 인증확인' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이미 인증된 이메일')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: VerifyEmailResponseDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
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
  async authUser(@Body() signInDto: SignInDto) {}

  //소셜로그인 - 구글
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async authgoogle() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Request() req, @Res() res) {
    console.log('req.query~~~~~~~~~~~');
    console.log(req.query);

    console.log('req.users~~~~~~~~~');
    console.log(req.user);

    //해당 이메일로 가입한 유저 찾기

    //유저 없다면 회원가입

    //유저 있다면 액세스토큰, 리프레시 토큰 전송
  }

  //소셜로그인 - 카카오
  @Post('/kakao')
  @ApiOperation({ summary: '카카오로그인' })
  async authKakao() {}
}
