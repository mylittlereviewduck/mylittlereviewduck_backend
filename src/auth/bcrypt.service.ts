import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor() {}

  async compare(pw: string, hashedPw: string): Promise<boolean> {
    return bcrypt.compare(pw, hashedPw);
  }

  async hash(pw: string, salt: string): Promise<string> {
    return bcrypt.hash(pw, salt);
  }

  async genSalt(saltRounds: number): Promise<string> {
    return bcrypt.genSalt(saltRounds);
  }
}
