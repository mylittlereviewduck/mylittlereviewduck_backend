import { PrismaService } from './../prisma/prisma.service';
import { MailService } from '../common/Email/Email.service';
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
import { Exception } from 'src/decorator/exception.decorator';
import { SendEmailWithVerificationResponseDto } from './dto/response/SendEmailWithVerificationResponse.dto';
import { VerifyEmailResponseDto } from './dto/response/VerifyEmailResponse.dto';
import { SignInDto } from './dto/signIn.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SendEmailWithVerificationDto } from './dto/send-email-with-verification.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { GoogleCallbackDto } from './dto/google-callback.dto';

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

  @Get('/:provider')
  async socialAuth(
    @Req() req: Request,
    @Res() res: Response,
    @Param('provider') provider: SocialLoginProvider, // google, kakao, naver, apple
  ) {
    return this.authService.getToken(req, res, provider);
  }

  @Get('/google/callback')
  async socialAuthCallback(
    @Query() query: GoogleCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialAuthCallbck('google', query);
  }

  @Get('/kakao/callback')
  async googleCallback(
    @Query() query: GoogleCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialAuthCallbck('kakao', query);
  }

  @Get('/naver/callback')
  async naverCallback(
    @Query() query: GoogleCallbackDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.socialAuthCallbck('naver', query);
  }
}
