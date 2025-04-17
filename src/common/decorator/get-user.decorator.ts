import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return;
    }

    return request.user as LoginUser;
  },
);
