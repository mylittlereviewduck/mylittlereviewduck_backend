export class GetUsersAllDto {
  email?: string;
  nickname?: string;
  interest1?: string;
  interest2?: string;
  isUserValid?: boolean;
  isUserSuspended?: boolean;
  isUserBlackList?: boolean;
  size: number;
  page: number;
}
