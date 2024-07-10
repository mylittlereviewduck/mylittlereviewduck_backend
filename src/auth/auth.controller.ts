import { EmailAuthService } from './email-auth.service';
import { PrismaService } from './../prisma/prisma.service';
import { MailService } from '../common/Email/email.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Exception } from '../../src/decorator/exception.decorator';
import { SendEmailVerificationResponseDto } from './dto/response/send-email-verification-response.dto';
import { VerifyEmailResponseDto } from './dto/response/verify-email-response.dto';
import { LoginDto } from './dto/signIn.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { GoogleCallbackDto } from './dto/google-callback.dto';
import { LoginResponseDto } from './dto/response/Login-Response.dto';
import { NaverCallbackDto } from './dto/naver-callback.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailAuthService: EmailAuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  //이메일 인증번호전송
  @Post('/email/send-verification')
  @ApiOperation({ summary: '이메일 인증 전송' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: SendEmailVerificationResponseDto })
  async sendEmailWithVerification(
    @Body() sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<void> {
    await this.emailAuthService.sendEmailVerificationCode(
      sendEmailVerificationDto,
    );
  }

  @Post('email/verify')
  @ApiOperation({ summary: '이메일 인증확인' })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이미 인증된 이메일')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: VerifyEmailResponseDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<boolean> {
    //true면 이메일 db저장
    return this.authService.verifyCode(verifyEmailDto);
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async authUser(
    @Body() loginDto: LoginDto,
  ): Promise<{ data: LoginResponseDto }> {
    const accessToken = await this.authService.login(loginDto);
    return { data: { accessToken } };
  }

  @Get('/:provider')
  @ApiOperation({ summary: '소셜로그인' })
  @Exception(404, '지원하지않는 서비스')
  @Exception(500, '서버에러')
  async socialAuth(
    @Req() req: Request,
    @Res() res: Response,
    @Param('provider') provider: SocialLoginProvider,
  ) {
    return this.authService.getToken(req, res, provider);
  }

  @Get('/google/callback')
  async googleLogin(
    @Query() query: GoogleCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialLogin('google', query);
  }

  @Get('/kakao/callback')
  async googleCallback(
    @Query() query: GoogleCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialLogin('kakao', query);
  }

  @Get('/naver/callback')
  async naverCallback(
    @Query() query: NaverCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialLogin('naver', query);
  }
}
