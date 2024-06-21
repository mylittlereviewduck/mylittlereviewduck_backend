import { FollowListPagerble } from './dto/follow-list-pagerble';
import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/User.entity';
import { PrismaService } from '../../src/prisma/prisma.service';
import { LoginUser } from '../../src/auth/model/login-user.model';

@Injectable()
export class FollowService {
  constructor(private readonly prismaService: PrismaService) {}

  async isfollowing(userIdx: number, toUserIdx: number): Promise<boolean> {
    return;
  }

  followUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  unfollowUser: (userIdx: number, toUserIdx: number) => Promise<UserEntity[]>;

  //두 메서드 통합하기
  // getFollowingList: (userIdx: number) => Promise<UserEntity[]>;

  // getFollwersList: (userIdx: number) => Promise<UserEntity[]>;

  async getFollowingList(
    followListPagerble: FollowListPagerble,
    loginUser?: LoginUser | undefined,
  ): Promise<UserEntity[]> {
    //팔로우리스트가져오기

    let followingList = await this.prismaService.followTb.findMany({
      include: {
        followee: {
          // 민경찬 (팔로워: 김기주) / 익명1 (팔로워:X null) / 익명2 (팔로워: null)
          include: {
            followee: {
              where: {
                followerIdx: loginUser.idx,
              },
            },
          },
        },
      },
      where: {
        followerIdx: followListPagerble.userIdx, // 태은이의 팔로우 목록
        followee: {
          deletedAt: null,
        },
        follower: {
          deletedAt: null,
        },
      },
      skip: (followListPagerble.page - 1) * followListPagerble.take,
      take: followListPagerble.take,
    });

    followingList.map((follower) => {
      // 팔로워의 팔로이안에 로그인 사용자가 있으면
      if (follower.followee) {
      }
    });

    console.log(followingList);

    //followTB에서

    return;
  }
}
