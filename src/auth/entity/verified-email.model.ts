export class EmailVerificationEntity {
  email: string;
  code: number;
  createdAt: Date;
  verifiedAt: Date;
}
