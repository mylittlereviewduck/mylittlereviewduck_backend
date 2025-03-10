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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Exception } from '../common/decorator/exception.decorator';
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
import { GetUser } from '../common/decorator/get-user.decorator';
import { LoginUser } from './model/login-user.model';
import { RefreshGuard } from './guard/refresh.guard';
import { SocialLoginDto } from './dto/social-login.dto';
import { AccessTokenResponseDto } from './dto/response/access-token-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailAuthService: EmailAuthService,
  ) {}

  @Post('/email/inspect-duplicate')
  @HttpCode(200)
  @ApiOperation({
    summary: '이메일 중복검사 / 이메일 인증번호 전송(회원가입용)',
    description: `"가입되지 않은 이메일 이어야합니다."  
       중복되지 않은 정상 메일이라면 상태코드 200반환  
       test1@a.com - test10@a.com은 테스트용으로 가입된 메일입니다.  
       이외에 가입되지 않은 다른 메일을 입력해주세요       
      `,
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(409, '이메일 중복')
  @ApiResponse({ status: 200 })
  async inspectEmailDuplicate(
    @Body() dto: SendEmailVerificationDto,
  ): Promise<void> {
    await this.emailAuthService.inspectEmailDuplicate(dto.email);
  }

  @Post('/email/inspect')
  @HttpCode(200)
  @ApiOperation({
    summary: '가입 이메일 검사 / 이메일 인증번호 전송(비밀번호 초기화용)',
    description: ` "가입된 이메일이어야 합니다."   
    비밀번호 초기화 전 이메일 인증으로 사용됩니다.     
       가입된 정상 이메일이면 상태코드 200반환 후 인증번호 메일 전송    
       test1@a.com - test10@a.com은 테스트용으로 가입된 메일입니다.  `,
  })
  @Exception(400, '유효하지 않은 요청')
  @Exception(404, '존재하지 않는 이메일')
  @ApiResponse({ status: 200 })
  async inspectEmail(@Body() dto: SendEmailVerificationDto): Promise<void> {
    await this.emailAuthService.inspectEmail(dto.email);
  }

  @Post('email/verify')
  @ApiOperation({
    summary: '이메일 인증번호 확인',
    description: `이메일이 정상 인증되면 200 반환 \n
      인증된 메일이 아니거나 유효시간 5분을 초과한 메일일 경우 상태코드 401 반환`,
  })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '인증되지 않은 이메일 / 유효시간 5분 초과한 이메일')
  @ApiResponse({ status: 200 })
  async checkEmailVerificationCode(@Body() dto: VerifyEmailDto): Promise<void> {
    await this.emailAuthService.checkEmailVerificationCode(dto.email, dto.code);
  }

  @Post('/login')
  @ApiOperation({
    summary: '로그인',
    description: ` <테스트용 가입된 계정>  
    테스트용 일반 계정 이메일: test1@a.com - test10@a.com  
    테스트용 관리자 계정 이메일: admin1@a.com - admin3@a.com  
    (비밀번호 전부 동일)  
    액세스 토큰 만료시간: 30분,  
    리프레쉬 토큰 만료시간: 2주    
    `,
  })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '존재하지 않는 계정')
  @Exception(409, '비밀번호 오류')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async authUser(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('/logout')
  @UseGuards(RefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '로그아웃',
    description: '리프레쉬 토큰 db에서 삭제',
  })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200 })
  async logout(@GetUser() loginUser: LoginUser): Promise<void> {
    await this.authService.logout(loginUser.idx);
  }

  @Post('/access-token')
  @UseGuards(RefreshGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '액세스 토큰발급',
    description: 'request 헤더에 리프레쉬 토큰 필요합니다.',
  })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @Exception(401, '권한 없음')
  @ApiResponse({ status: 200, type: AccessTokenResponseDto })
  async getAccessToken(
    @GetUser() loginUser: LoginUser,
  ): Promise<AccessTokenResponseDto> {
    const accessToken = await this.authService.generateToken(
      'access',
      loginUser.idx,
      loginUser.isAdmin,
      30 * 60,
    );

    return { accessToken };
  }

  @Post('/kakao')
  @ApiOperation({ summary: '카카오 로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async kakaoLogin(@Body() dto: SocialLoginDto): Promise<LoginResponseDto> {
    return await this.authService.socialLogin('kakao', dto);
  }

  @Post('/naver')
  @ApiOperation({ summary: '네이버 로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async naverLogin(@Body() dto: SocialLoginDto): Promise<LoginResponseDto> {
    return await this.authService.socialLogin('naver', dto);
  }

  @Post('/google')
  @ApiOperation({ summary: '구글 로그인' })
  @HttpCode(200)
  @Exception(400, '유효하지 않은 요청')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async googleLogin(@Body() dto: SocialLoginDto): Promise<LoginResponseDto> {
    return await this.authService.socialLogin('google', dto);
  }

  @Get('/:provider')
  @ApiOperation({ summary: '소셜로그인', deprecated: true })
  @Exception(404, '지원하지 않는 서비스')
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async socialAuth(
    @Req() req: Request,
    @Res() res: Response,
    @Param('provider') provider: SocialLoginProvider,
  ): Promise<LoginResponseDto> {
    return this.authService.getToken(req, res, provider);
  }

  @Get('/kakao/callback')
  @ApiOperation({ summary: '카카오 로그인 콜백uri', deprecated: true })
  async kakaoAuth(@Query() query: KakaoCallbackDto): Promise<LoginResponseDto> {
    return await this.authService.socialLogin('kakao', query);
  }

  @Get('/naver/callback')
  @ApiOperation({ summary: '네이버 로그인 콜백uri', deprecated: true })
  async naverAuth(@Query() query: NaverCallbackDto): Promise<LoginResponseDto> {
    return await this.authService.socialLogin('naver', query);
  }

  @Get('/google/callback')
  @ApiOperation({ summary: '네이버 로그인 콜백uri', deprecated: true })
  async googleAuth(
    @Query() query: GoogleCallbackDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.socialLogin('google', query);
  }
}
