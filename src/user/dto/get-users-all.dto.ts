import { UserStatus } from '../type/user-status.type';
import { UserPagerbleDto } from './user-pagerble.dto';

export class GetUsersAllDto extends UserPagerbleDto {
  email?: string;
  nickname?: string;
  interest1?: string;
  interest2?: string;
  status?: UserStatus;

  // ??는 null과 undefiend만 처리된다.
}
