import { ApiProperty } from '@nestjs/swagger';

export class UserBlockEntity {
  @ApiProperty({ example: 1, description: '차단한 사람' })
  blockerIdx: number;

  @ApiProperty({ example: 10, description: '차단당한 사람' })
  blockedIdx: number;

  @ApiProperty({ example: '2024-08-01T07:58:57.844Z', description: '가입일' })
  createdAt: Date;

  constructor(data) {
    this.blockerIdx = data.blockerIdx;
    this.blockedIdx = data.blockedIdx;
    this.createdAt = data.createdAt;
  }
}
