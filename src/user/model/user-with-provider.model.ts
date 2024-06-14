export class UserWithProvider {
  idx: number;

  email: string;

  provider: string;

  providerKey: string;

  constructor(data) {
    this.idx = data.idx;
    this.email = data.email;
    this.provider = data.provider;
    this.providerKey = data.providerKey;
  }
}
