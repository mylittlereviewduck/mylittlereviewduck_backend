import { UserStatus } from '../type/user-status.type';

export class GetUsersAllDto {
  email?: string;
  nickname?: string;
  interest1?: string;
  interest2?: string;
  status?: UserStatus;
  size: number;
  page: number;

  // ??는 null과 undefiend만 처리된다.
}
