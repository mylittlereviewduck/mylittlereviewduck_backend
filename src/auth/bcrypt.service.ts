import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor(private readonly configService: ConfigService) {}

  async compare(pw: string, hashedPw: string): Promise<boolean> {
    return bcrypt.compare(pw, hashedPw);
  }

  async hash(pw: string): Promise<string> {
    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS'),
    );
    const salt = await bcrypt.genSalt(saltRounds);

    return bcrypt.hash(pw, salt);
  }

  async genSalt(saltRounds: number): Promise<string> {
    return bcrypt.genSalt(saltRounds);
  }
}
