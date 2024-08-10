import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigService],
  providers: [],
  exports: [],
})
export class AwsModule {}
