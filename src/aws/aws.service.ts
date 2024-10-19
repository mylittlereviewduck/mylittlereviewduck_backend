import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  s3Client: S3Client;
  bucketName = this.configService.get<'string'>('AWS_BUCKET_NAME');
  region = this.configService.get<'string'>('AWS_REGION');

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<'string'>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<'string'>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<'string'>('AWS_SECRET_KEY'),
      },
    });
  }

  async uploadImageToS3(file: Express.Multer.File) {
    const fileName = String(new Date().getTime());
    const ext = file.mimetype.split('/')[1];

    const command = new PutObjectCommand({
      Bucket: this.configService.get<'string'>('AWS_BUCKET_NAME'),
      Key: `${fileName}.${ext}`,
      Body: file.buffer,
      ContentType: `image/${ext}`,
    });

    await this.s3Client.send(command);

    return `https://s3.${this.region}.amazonaws.com/${this.bucketName}/${fileName}.${ext}`;
  }
}
