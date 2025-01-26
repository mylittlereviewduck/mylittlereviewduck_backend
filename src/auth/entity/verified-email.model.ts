import { Prisma } from '@prisma/client';

const emailVerification =
  Prisma.validator<Prisma.EmailVerificaitonTbAggregateArgs>()({});

export type EmailVerificaiton = Prisma.EmailVerificaitonTbGetPayload<
  typeof emailVerification
>;

export class EmailVerificationEntity {
  email: string;
  code: number;
  createdAt: Date;
  verifiedAt: Date;

  constructor(data: EmailVerificaiton) {
    this.code = data.code;
    this.email = data.email;
    this.createdAt = data.createdAt;
    this.verifiedAt = data.verifiedAt;
  }
}
