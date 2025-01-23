import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmTokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveFcmToken(userIdx: string, token: string) {
    await this.prismaService.fcmTokenTb.create({
      data: {
        accountIdx: userIdx,
        token: token,
      },
    });
  }

  async getFcmToken(userIdx: string): Promise<string | string[]> {
    const result = await this.prismaService.fcmTokenTb.findMany({
      where: {
        accountIdx: userIdx,
      },
    });

    return result.map((data) => data.token);
  }
}
