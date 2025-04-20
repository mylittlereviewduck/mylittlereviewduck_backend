import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';

//미들웨어 구현시 Injectable()사용, NestMiddleware implements 해야한다.
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly prismaService: PrismaService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 요청 객체로부터 ip, http method, url, user agent를 받는다.
    const { ip, method, originalUrl, body } = req;
    const userAgent = req.get('user-agent');

    // 응답이 끝나는 이벤트가 발생하면 로그를 찍는다.

    try {
      res.on('finish', async () => {
        const { statusCode, statusMessage } = res;
        if (statusCode >= 400 && statusCode <= 500) {
          this.logger.log('request.body : ', body);
          this.logger.warn(
            `${method} ${originalUrl}  ${statusCode} ${statusMessage} ${ip} ${userAgent}`,
          );
          await this.prismaService.logTb.create({
            data: {
              method: method,
              url: originalUrl,
              statusCode: statusCode,
              ...(statusMessage && { statusMessage: statusMessage }),
              ...(ip && { ip: ip }),
              ...(userAgent && { userAgent: userAgent }),
            },
          });
        }
      });
      next();
    } catch (err) {
      console.log(`error : ${err}`);
      next();
    }
  }
}
