import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpinionEntity } from './entity/Opinion.entity';
import { upsertOpinionDto } from './dto/upsert-opinion.dto';

@Injectable()
export class OpinionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOpinion(dto: upsertOpinionDto): Promise<OpinionEntity> {
    const newOpinionData = await this.prismaService.opinionTb.create({
      include: {
        accountTb: true,
      },
      data: {
        accountIdx: dto.userIdx,
        title: dto.title,
        content: dto.content,
      },
    });

    return new OpinionEntity(newOpinionData);
  }

  async getOpinion(opinionIdx: number): Promise<OpinionEntity | null> {
    const opinionData = await this.prismaService.opinionTb.findUnique({
      where: {
        idx: opinionIdx,
      },
      include: {
        accountTb: true,
      },
    });

    if (!opinionData) return null;

    return new OpinionEntity(opinionData);
  }
}
