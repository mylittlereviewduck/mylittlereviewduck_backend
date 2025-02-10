import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { SearchHistoryResponseDto } from './dto/response/search-history.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { GetSearchKeywordDto } from './dto/get-search-keyword.dto';
import { Cron } from '@nestjs/schedule';
import { ReviewService } from 'src/review/review.service';
import { DEFAULT_REDIS, RedisService } from '@liaoliaots/nestjs-redis';
import { HotKeyword, HotKeywordType } from './dto/hot-keyword.type';

@Injectable()
export class SearchKeywordService {
  private readonly redis: Redis | null;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow(DEFAULT_REDIS);
  }

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
      data: {
        keyword: normalizedKeyword,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
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

  async getSearchKeyowrd(dto: GetSearchKeywordDto): Promise<string[]> {
    const searchKeywordData = await this.prismaService.searchKeywordTb.groupBy({
      _count: {
        keyword: true,
      },
      where: {
        createdAt: {
          ...(dto.createdAtLte && { lte: dto.createdAtLte }),
          ...(dto.createdAtGte && { gte: dto.createdAtGte }),
        },
      },
      by: ['keyword'],
      orderBy: {
        _count: {
          keyword: 'desc',
        },
      },
    });

    return searchKeywordData.map((elem) => elem.keyword);
  }

  @Cron('* * * * *')
  async cacheHotSearchKeyword(): Promise<HotKeyword[]> {
    const firtstRecentNoon = this.reviewService.getMostRecentNoon();
    //prettier-ignore
    const secondRecentNoon = new Date(firtstRecentNoon.getTime() - 12* 60 *60 * 1000);

    const hotSearchKeywords = await this.getSearchKeyowrd({
      createdAtLte: firtstRecentNoon,
      createdAtGte: secondRecentNoon,
    });

    let rank = 1;
    const presentRanekdKeyword: HotKeyword[] = hotSearchKeywords.map((elem) => {
      return {
        rank: rank++,
        keyword: elem,
        status: 'equal',
      };
    });

    const beforeRankedKeywords = JSON.parse(
      await this.redis.get(`search:hot:present`),
    ) as HotKeyword[];

    if (!beforeRankedKeywords) {
      //prettier-ignore
      await this.redis.set(`search:hot:present`, JSON.stringify(presentRanekdKeyword))
      return presentRanekdKeyword;
    }

    const comparedKeywords: HotKeyword[] = presentRanekdKeyword.map(
      (currentKeyword) => {
        const previousKeyword = beforeRankedKeywords.find((elem) => {
          return elem.keyword === currentKeyword.keyword;
        });

        let status: HotKeywordType = 'equal';

        if (!previousKeyword) status = 'up';
        else if (currentKeyword.rank < previousKeyword.rank) status = 'up';
        else if (currentKeyword.rank > previousKeyword.rank) status = 'down';

        return {
          ...currentKeyword,
          status,
        };
      },
    );

    this.redis.set(`search:hot:before`, JSON.stringify(beforeRankedKeywords));
    this.redis.set(`search:hot:present`, JSON.stringify(comparedKeywords));

    return comparedKeywords;
  }

  async getCachedHotSearchKeywod(): Promise<HotKeyword[]> {
    return JSON.parse(await this.redis.get(`search:hot:present`));
  }

  async onModuleInit() {
    console.log('searchKeyword Service start');
    await this.cacheHotSearchKeyword();

    //캐싱
  }
}
