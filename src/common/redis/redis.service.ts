import { Injectable } from '@nestjs/common';
import { IRedisService } from './interface/IRedisService';
import { RedisClientType, createClient } from 'redis';

type StringType = { [Key: string]: string };

@Injectable()
export class RedisService implements IRedisService {
  private readonly redis: RedisClientType;

  constructor() {
    this.redis = createClient();
  }

  set: (key: string, value: string) => Promise<void> = async (key, value) => {
    this.redis.set(key, value);
  };

  get: (key: string) => Promise<string | null> = async (key) => {
    return this.redis.get(key);
  };

  del: (key: string) => Promise<void>;
}
