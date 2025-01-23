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
}
