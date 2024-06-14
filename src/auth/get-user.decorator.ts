import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// ## 로그인 기능에 대한 전략 패턴 구현하기

// 전략 디자인 패턴 공부하기
// 개방 폐쇄 어떻게 할지 생각해보기

// 1. auth service interface에 localLogin, socialLogin 메서드 정의
//  ㄴ 주입을 자동으로 해줄 것 local전략, kakao전략, apple전략 ? get('local').login(accessToken);
