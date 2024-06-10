import { PrismaService } from './../prisma/prisma.service';
import { MailService } from '../common/Email/Email.service';
import { NaverAuthGuard } from './authNaver.guard';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Exception } from 'src/decorator/exception.decorator';
import { SendEmailWithVerificationResponseDto } from './dto/response/SendEmailWithVerificationResponse.dto';
import { VerifyEmailResponseDto } from './dto/response/VerifyEmailResponse.dto';
import { SignInDto } from './dto/SignIn.dto';
import { VerifyEmailDto } from './dto/VerifyEmail.dto';
import { SendEmailWithVerificationDto } from './dto/SendEmailWithVerification.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response, response } from 'express';
import { KakaoAuthGuard } from './authKakao.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  //이메일 인증번호전송
  @Post('/email/send')
  @ApiOperation({ summary: '이메일 인증 전송' })
  @Exception(400, '유효하지않은 요청')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: SendEmailWithVerificationResponseDto })
  async sendEmailWithVerification(
    @Body() sendEmailWithVerificationDto: SendEmailWithVerificationDto,
  ): Promise<void> {
    const verificationCode = Math.floor(Math.random() * 900000 + 100000);

    await this.mailService.sendMailWithVerificationCode(
      sendEmailWithVerificationDto,
      verificationCode,
    );
  }

  //이메일 인증번호확인
  //req body
  @Post('email/verify')
  @ApiOperation({ summary: '이메일 인증확인' })
  @Exception(400, '유효하지않은 요청')
  @Exception(409, '이미 인증된 이메일')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: VerifyEmailResponseDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<boolean> {
    //true면 이메일 db저장

    //서비스코드로이동
    //테스트해보기
    const verifiedEmail = await this.prismaService.verifiedEmailTb.findFirst({
      where: {
        email: verifyEmailDto.email,
        code: verifyEmailDto.code,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verifiedEmail) {
      throw new UnauthorizedException('Unauthorized email');
    }

    await this.prismaService.verifiedEmailTb.update({
      data: { isVerified: false },
      where: { idx: verifiedEmail.idx },
    });

    return true;
  }

  //기본로그인
  //req body
  @Post('/signin')
  @ApiOperation({ summary: '로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지않은 요청')
  @Exception(401, '권한 없음')
  @Exception(500, '서버 에러')
  @ApiResponse({ status: 200, type: SignInDto })
  async authUser(
    @Body() signInDto: SignInDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.signIn(signInDto);
  }

  //소셜로그인 - 구글
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인' })
  async authWithGoogle(): Promise<void> {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.signInOAuth(req, res);
    return { accessToken };
  }

  //소셜로그인 - 네이버
  //오늘도리뷰 - 네이버 로그인 검수요청하기
  @Get('/naver')
  @UseGuards(NaverAuthGuard)
  @ApiOperation({ summary: '네이버 로그인' })
  async authWithNaver(): Promise<void> {}

  @Get('/naver/callback')
  @UseGuards(NaverAuthGuard)
  async naverRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.signInOAuth(req, res);
    return { accessToken };
  }

  //소셜로그인 - 카카오
  @Get('/kakao')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({ summary: '카카오로그인' })
  async authWithKakao(): Promise<void> {}

  @Get('/kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.authService.signInOAuth(req, res);
    return { accessToken };
  }
}
