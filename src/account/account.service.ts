import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountService {
  constructor() {}

  async getAccountByidx() {}

  async getAccountBynickname() {}

  async getAccountByEmail() {}

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
