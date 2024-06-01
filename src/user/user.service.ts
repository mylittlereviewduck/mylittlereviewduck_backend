import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor() {}

  async getUserByidx() {}

  async getUserBynickname() {}

  async getUserByEmail() {}

  async getMyinfo() {}

  async updateMyinfo() {}

  async updateMyProfileImg() {}

  async deleteMyProfileImg() {}

  async getFollowingList() {}

  async getFollwersList() {}

  async followUser() {}

  async unfollowUser() {}

  async isfollowing() {}

  async isUserBlocked() {}

  async isReviewBloked() {}

  async getBookmarkListByUserIdx() {}

  async getCommentListByUserIdx() {}

  async getReviewListByUserIdx() {}
}
