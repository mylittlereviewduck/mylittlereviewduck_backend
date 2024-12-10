import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import similarity from 'compute-cosine-similarity';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async recordSearch(keyword: string, userIdx: string): Promise<void> {
    const normalizedKeyword = keyword.trim().toLowerCase();

    await this.prisma.searchHistoryTb.create({
      data: { keyword: normalizedKeyword, accountIdx: userIdx },
    });
  }

  async getRecommendedKeywords(userIdx?: string): Promise<string[]> {
    const pastDays = 30; // 최근 30일 기준
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - pastDays);

    // 최근 1달 기준 검색 로그 가져오기
    const recentLogs = await this.prisma.searchHistoryTb.findMany({
      where: {
        createdAt: {
          gte: recentDate,
        },
      },
    });

    // 키워드 그룹화 및 검색 횟수 집계
    //prettier-ignore
    const keywordCount = recentLogs.reduce((acc, log) => {
      acc[log.keyword] = (acc[log.keyword] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // 검색 횟수 기준으로 키워드 정렬
    const popularKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map((entry) => entry[0]);

    if (!userIdx) {
      return popularKeywords;
    }

    let recentKeywords: string[] = [];

    const userRecentLogs = await this.prisma.searchHistoryTb.findMany({
      where: {
        accountIdx: userIdx,
        createdAt: {
          gte: recentDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    recentKeywords = userRecentLogs.map((log) => log.keyword);

    if (recentKeywords.length === 0) {
      return popularKeywords;
    }

    // 유사한 키워드 추천
    const allKeywords = Object.keys(keywordCount);
    const recentVectors = recentKeywords.map(this.textToVector);

    const similarKeywords = allKeywords.map((keyword) => {
      const keywordVector = this.textToVector(keyword);
      const maxSimilarity = Math.max(
        ...recentVectors.map((vector) => similarity(vector, keywordVector)),
      );
      return {
        keyword,
        similarity: maxSimilarity,
      };
    });

    similarKeywords.sort((a, b) => b.similarity - a.similarity);
    const topSimilarKeywords = similarKeywords.slice(0, 10);

    // 결과 병합 및 중복 제거
    const allRecommendedKeywords = [
      ...new Set([
        ...popularKeywords,
        ...topSimilarKeywords.map((k) => k.keyword),
      ]),
    ].slice(0, 10);

    return allRecommendedKeywords;
  }

  private textToVector(text: string): number[] {
    const words = text.split(' ');
    const wordFreq: { [key: string]: number } = {};
    words.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    return Object.values(wordFreq);
  }
}
