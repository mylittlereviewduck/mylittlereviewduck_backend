import { IsIn, IsString } from 'class-validator';

export class SuspendUserDto {
  @IsIn(['7D', '1M', 'forever'])
  suspendPeriod: '7D' | '1M' | 'forever';
}
