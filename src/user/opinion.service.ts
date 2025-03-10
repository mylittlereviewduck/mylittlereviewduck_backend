import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpinionEntity } from './entity/Opinion.entity';
import { createOpinionDto } from './dto/create-opinion.dto';

@Injectable()
export class OpinionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOpinion(dto: createOpinionDto): Promise<OpinionEntity> {
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
}
