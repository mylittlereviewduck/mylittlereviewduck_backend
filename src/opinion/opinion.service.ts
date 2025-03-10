import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpinionEntity } from './entity/Opinion.entity';
import { createOpinionDto } from './dto/create-opinion.dto';
import { updateOpinionDto } from './dto/update-opinion.dto';

@Injectable()
export class OpinionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOpinion(
    userIdx: string,
    dto: createOpinionDto,
  ): Promise<OpinionEntity> {
    const newOpinionData = await this.prismaService.opinionTb.create({
      include: {
        accountTb: true,
      },
      data: {
        accountIdx: userIdx,
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

  async updateMyOpinion(
    userIdx: string,
    dto: updateOpinionDto,
  ): Promise<OpinionEntity> {
    const myOpinion = await this.getOpinion(dto.idx);

    if (!myOpinion) throw new NotFoundException('Not Found Opinion');

    if (userIdx !== myOpinion.user.idx)
      throw new UnauthorizedException('Unauthorized');

    const opinionData = await this.prismaService.opinionTb.update({
      where: {
        idx: dto.idx,
      },
      data: {
        title: dto.title,
        content: dto.content,
      },
      include: {
        accountTb: true,
      },
    });

    return new OpinionEntity(opinionData);
  }
}
