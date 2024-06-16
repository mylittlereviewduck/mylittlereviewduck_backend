import { Injectable } from '@nestjs/common';
import { LoginUser } from 'src/auth/model/login-user.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentLikeCheckService {
  constructor(private readonly prismaService: PrismaService) {}

  //함수 분리
  isCommentLiked: (
    loginUser: LoginUser,
    commentIdx: number,
  ) => Promise<boolean>;
}
