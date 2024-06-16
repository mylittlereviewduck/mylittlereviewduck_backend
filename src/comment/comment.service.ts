import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentEntity } from './entity/Comment.entity';
import { CreateCommentDto } from './dto/CreateComment.dto';
import { UpdateCommentDto } from './dto/UpdateComment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUser } from 'src/auth/model/login-user.model';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    loginUser: LoginUser,
  ): Promise<CommentEntity> {
    const review = await this.prismaService.reviewTb.findUnique({
      where: { idx: createCommentDto.reviewIdx },
    });

    if (!review) {
      throw new NotFoundException('Not Found Review');
    }

    const commentData = await this.prismaService.commentTb.create({
      data: {
        reviewIdx: createCommentDto.reviewIdx,
        accountIdx: loginUser.idx,
        content: createCommentDto.content,
        commentIdx: createCommentDto.commentIdx,
      },
    });

    return new CommentEntity(commentData);
  }

  async updateComment(
    updateCommentDto: UpdateCommentDto,
    loginUser: LoginUser,
  ): Promise<CommentEntity> {
    const comment = await this.prismaService.commentTb.findUnique({
      where: {
        idx: updateCommentDto.commentIdx,
      },
    });

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    if (comment.accountIdx !== loginUser.idx) {
      throw new UnauthorizedException('Unauthorized');
    }

    const commentData = await this.prismaService.commentTb.update({
      data: {
        content: updateCommentDto.content,
        updatedAt: new Date(),
      },
      where: {
        idx: updateCommentDto.commentIdx,
      },
    });

    return new CommentEntity(commentData);
  }

  async deleteComment(
    commentIdx: number,
    loginUser: LoginUser,
  ): Promise<CommentEntity> {
    const comment = await this.prismaService.commentTb.findUnique({
      where: {
        idx: commentIdx,
      },
    });

    if (!comment) {
      throw new NotFoundException('Not Found Comment');
    }

    if (comment.accountIdx !== loginUser.idx) {
      throw new UnauthorizedException('Unauthorized');
    }

    const deletedCommentData = await this.prismaService.commentTb.update({
      data: {
        deletedAt: new Date(),
      },
      where: {
        idx: commentIdx,
        accountIdx: loginUser.idx,
      },
    });
    return new CommentEntity(deletedCommentData);
  }

  async getCommentAll(reviewIdx: number): Promise<CommentEntity[]> {
    const commentData = await this.prismaService.commentTb.findMany({
      where: {
        reviewIdx: reviewIdx,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return commentData.map((elem) => new CommentEntity(elem));
  }
}
