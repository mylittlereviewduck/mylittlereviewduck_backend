import { UserStatus } from '../type/user-status.type';
import { PagerbleDto } from './pagerble.dto';

export class GetUsersAllDto extends PagerbleDto {
  email?: string;
  nickname?: string;
  interest1?: string;
  interest2?: string;
  status?: UserStatus;

  // ??는 null과 undefiend만 처리된다.
}
