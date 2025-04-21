import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { SearchHistoryResponseDto } from './dto/response/search-history.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { GetSearchKeywordDto } from './dto/get-search-keyword.dto';
import { Cron } from '@nestjs/schedule';
import { ReviewService } from 'src/review/review.service';
import { DEFAULT_REDIS, RedisService } from '@liaoliaots/nestjs-redis';
import { HotKeyword, HotStatusType } from './dto/hot-keyword.type';

@Injectable()
export class SearchKeywordService {
  private readonly redis: Redis | null;

  constructor(
    private readonly logger: ConsoleLogger,
    private readonly prismaService: PrismaService,
    private readonly reviewService: ReviewService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow(DEFAULT_REDIS);
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('cache HotSearchKeyword');
    await this.cacheHotSearchKeyword();
  }

  @OnEvent('search.*', { async: true })
  async createSearchKeyword(keyword: string, userIdx: string): Promise<void> {
    console.log('실행');
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

  async aggregateHotKeywords(dto: GetSearchKeywordDto): Promise<string[]> {
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
      take: 10,
    });

    return searchKeywordData.map((elem) => elem.keyword);
  }

  @Cron('0 0,12 * * *')
  async cacheHotSearchKeyword(): Promise<HotKeyword[]> {
    const firstRecentNoon = this.reviewService.getMostRecentNoon();
    //prettier-ignore
    const secondRecentNoon = new Date(firstRecentNoon.getTime() - 12* 60 *60 * 1000);

    let hotSearchKeywords = await this.aggregateHotKeywords({
      createdAtLte: firstRecentNoon,
      createdAtGte: secondRecentNoon,
    });

    if (hotSearchKeywords.length === 0) {
      hotSearchKeywords = await this.aggregateHotKeywords({});
    }

    let rank = 1;
    const presentRankdKeyword: HotKeyword[] = hotSearchKeywords.map((elem) => {
      return {
        rank: rank++,
        keyword: elem,
        status: 'new',
      };
    });

    const beforeRankedKeywords = JSON.parse(
      await this.redis.get(`search:hot:present`),
    ) as HotKeyword[];

    if (!beforeRankedKeywords) {
      //prettier-ignore
      await this.redis.set(`search:hot:present`, JSON.stringify(presentRankdKeyword))
      return presentRankdKeyword;
    }

    const comparedKeywords: HotKeyword[] = presentRankdKeyword.map(
      (currentKeyword) => {
        const previousKeyword = beforeRankedKeywords.find((elem) => {
          return elem.keyword === currentKeyword.keyword;
        });

        let status: HotStatusType = 'new';
        if (previousKeyword) {
          if (currentKeyword.rank === previousKeyword.rank) status = 'equal';
          else if (currentKeyword.rank < previousKeyword.rank) status = 'up';
          else status = 'down';
        }

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

  async fetchHotSearchKeywords(): Promise<HotKeyword[]> {
    const cacheKey = `search:hot:present`;
    const cachedHotKeywords = await this.redis.get(cacheKey);
    if (cachedHotKeywords) {
      return JSON.parse(cachedHotKeywords) as HotKeyword[];
    }

    const keywords = await this.aggregateHotKeywords({});

    const hotKeywords: HotKeyword[] = keywords.map((keyword, index) => ({
      rank: index + 1,
      keyword,
      status: 'new',
    }));

    await this.redis.set(
      cacheKey,
      JSON.stringify(hotKeywords),
      'EX',
      60 * 60 * 24,
    );

    return hotKeywords;
  }
}
