import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmTokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveFcmToken(token: string, deviceIdx: string) {
    await this.prismaService.fcmTokenTb.upsert({
      where: {
        deviceIdx: deviceIdx,
      },
      update: {
        token: token,
      },
      create: {
        token,
        deviceIdx,
      },
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
