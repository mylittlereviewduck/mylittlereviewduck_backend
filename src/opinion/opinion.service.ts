import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpinionEntity } from './entity/Opinion.entity';
import { UpsertOpinionDto } from './dto/upsert-opinion.dto';

@Injectable()
export class OpinionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOpinion(
    userIdx: string,
    dto: UpsertOpinionDto,
  ): Promise<OpinionEntity> {
    const newOpinionData = await this.prismaService.opinionTb.create({
      include: {
        accountTb: true,
        opinionStatusTb: true,
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
        opinionStatusTb: true,
      },
    });
    console.log('opinionData: ', opinionData);

    if (!opinionData) return null;

    return new OpinionEntity(opinionData);
  }

  async updateMyOpinion(
    userIdx: string,
    opinionIdx: number,
    dto: UpsertOpinionDto,
  ): Promise<OpinionEntity> {
    const myOpinion = await this.getOpinion(opinionIdx);

    if (!myOpinion) throw new NotFoundException('Not Found Opinion');

    if (userIdx !== myOpinion.user.idx)
      throw new UnauthorizedException('Unauthorized');

    const opinionData = await this.prismaService.opinionTb.update({
      where: {
        idx: opinionIdx,
      },
      data: {
        title: dto.title,
        content: dto.content,
      },
      include: {
        accountTb: true,
        opinionStatusTb: true,
      },
    });

    return new OpinionEntity(opinionData);
  }
}
