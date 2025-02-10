import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { SearchHistoryResponseDto } from './dto/response/search-history.dto';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SearchKeywordService {
  constructor(private readonly prismaService: PrismaService) {}

  @OnEvent('search.*', { async: true })
  async createSearchKeyword(keyword: string, userIdx: string): Promise<void> {
    const normalizedKeyword = keyword.trim().toLowerCase();

    await this.prismaService.searchHistoryTb.upsert({
      create: { keyword: normalizedKeyword, accountIdx: userIdx },
      where: {
        accountIdx_keyword: {
          keyword: normalizedKeyword,
          accountIdx: userIdx,
        },
      },
      update: {
        createdAt: new Date(),
      },
    });

    await this.prismaService.searchKeywordTb.create({
      data: { keyword: normalizedKeyword },
    });
  }

  async getUserSearchHistory(
    userIdx: string,
  ): Promise<SearchHistoryResponseDto> {
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

    return {
      keywords: searchHistory.map((elem) => {
        return elem.keyword;
      }),
    };
  }
}
