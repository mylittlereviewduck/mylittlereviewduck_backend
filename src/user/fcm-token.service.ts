import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmTokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveFcmToken(userIdx: string, token: string, deviceIdx: string) {
    await this.prismaService.fcmTokenTb.create({
      // where: {
      // deviceIdx: deviceIdx,
      // },
      data: {
        accountIdx: userIdx,
        token: token,
        // deviceIdx: deviceIdx,
      },
      // update: {
      // token: token,
      // },
    });
  }

  async getFcmTokens(userIdxs: string[]): Promise<string[]> {
    const result = await this.prismaService.fcmTokenTb.findMany({
      select: {
        token: true,
      },
      where: {
        accountIdx: {
          in: userIdxs,
        },
      },
    });

    return result.map((elem) => elem.token);
  }

  async getFcmTokenAll(): Promise<string[]> {
    const result = await this.prismaService.fcmTokenTb.findMany({
      select: {
        token: true,
      },
    });
    return result.map((elem) => elem.token);
  }
}
