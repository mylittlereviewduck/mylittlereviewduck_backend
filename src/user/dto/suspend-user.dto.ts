export class SuspendUserDto {
  userIdx: string;
  suspendPeriod: '7d' | '1M' | 'forever';
}
