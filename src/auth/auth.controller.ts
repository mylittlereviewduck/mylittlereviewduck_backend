import { EmailAuthService } from './email-auth.service';
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
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Exception } from '../../src/decorator/exception.decorator';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { GoogleCallbackDto } from './dto/google-callback.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { NaverCallbackDto } from './dto/naver-callback.dto';
import { KakaoCallbackDto } from './dto/kakao-callback.dto';
import { GetUser } from './get-user.decorator';
import { LoginUser } from './model/login-user.model';
import { RefreshGuard } from './guard/refresh.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailAuthService: EmailAuthService,
  ) {}

  //이메일 인증번호전송
  @Post('/email/send-verification')
  @HttpCode(200)
  @ApiOperation({ summary: '이메일 중복검사 / 인증번호 전송' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이메일 중복')
  @ApiResponse({ status: 200 })
  async sendEmailWithVerification(
    @Body() sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<void> {
    await this.emailAuthService.sendEmailVerificationCode(
      sendEmailVerificationDto,
    );
  }

  @Post('email/verify')
  @ApiOperation({
    summary: '이메일 인증확인',
    description:
      '인증된 메일이 아니거나 유효시간 5분을 초과한 메일일 경우 상태코드 401 반환',
  })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '인증되지 않은 이메일 / 유효시간 5분 초과한 이메일')
  @Exception(409, '이미 인증된 이메일')
  @ApiResponse({ status: 200 })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
    const verifiedEmail =
      await this.emailAuthService.getEmailWithVerificationCode(
        verifyEmailDto.email,
        verifyEmailDto.verificationCode,
      );

    if (!verifiedEmail) {
      throw new UnauthorizedException('Unauthorized email');
    }

    if (
      new Date().getTime() - verifiedEmail.createdAt.getTime() >
      5 * 60 * 1000
    ) {
      throw new UnauthorizedException('Authentication TimeOut');
    }

    this.emailAuthService.verifyEmail(verifiedEmail.email);
  }

  @Post('/login')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async authUser(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('/access-token')
  @UseGuards(RefreshGuard)
  @ApiOperation({ summary: '액세스 토큰발급' })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200 })
  async getAccessToken(
    @GetUser() loginUser: LoginUser,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.generateToken(
      'access',
      loginUser.idx,
      loginUser.isAdmin,
      5 * 60,
    );

    return { accessToken };
  }

  @Get('/:provider')
  @ApiOperation({ summary: '소셜로그인' })
  @Exception(404, '지원하지않는 서비스')
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
  async kakaoLogin(
    @Query() query: KakaoCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialLogin('kakao', query);
  }

  @Get('/naver/callback')
  async naverLogin(
    @Query() query: NaverCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialLogin('naver', query);
  }
}
