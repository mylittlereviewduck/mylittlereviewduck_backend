export class GetUsersAllDto {
  email?: string | undefined;
  nickname?: string | undefined;
  interest1?: string | undefined;
  interest2?: string | undefined;
  isUserValid?: boolean;
  isUserSuspended?: boolean;
  isUserBlackList?: boolean;

  size: number;
  page: number;
}
