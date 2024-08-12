import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from './user.service';

@Injectable()
export class UserReportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  //   async reportUser(
  //     accountIdx: number,
  //     toAccountIdx: number,
  //   ): Promise<UserReportEntity> {
  //     const user = await this.userService.getUser({ idx: toAccountIdx });

  //     if (!user) {
  //       throw new NotFoundException('Not Found User');
  //     }

  //     const existingReport = await this.userReportCheckService.isReported(accountIdx, [user])

  //     const userReportData = await this.prismaService.accountReportTb.create({
  //         data: {
  //           blockerIdx: accountIdx,
  //           blockedIdx: toAccountIdx,
  //         },
  //       });

  //       console.log('userBlockEntity: ', userBlockData);

  //       return new UserReportEntity(userBlockData);

  //     return;
  //   }
}
