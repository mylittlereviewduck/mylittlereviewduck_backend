import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log('getUser실행');

    if (!request.user) {
      console.log('req.user없음 함수종료');
      return;
    }

    return request.user;
  },
);
