import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchKeywordService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSearchKeyword(keyword: string, userIdx: string): Promise<void> {
    const normalizedKeyword = keyword.trim().toLowerCase();

    await this.prismaService.searchHistoryTb.create({
      data: { keyword: normalizedKeyword, accountIdx: userIdx },
    });

    await this.prismaService.searchKeywordTb.create({
      data: { keyword: normalizedKeyword },
    });
  }

  async getUserSearchKeyword(userIdx: string): Promise<string[]> {
    const searchHistory = await this.prismaService.searchHistoryTb.groupBy({
      by: ['keyword'],
      where: {
        accountIdx: userIdx,
      },
      _max: {
        createdAt: true,
      },
      orderBy: {
        _max: {
          createdAt: 'desc',
        },
      },
      take: 10,
    });

    console.log(searchHistory);

    return;
  }
}
