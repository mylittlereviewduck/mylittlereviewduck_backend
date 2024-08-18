import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedExt = ['jpg', 'jpeg', 'png', 'gif'];
  private readonly maxSize = 10 * 1024 * 1024;

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file');
    }

    const ext = file.mimetype.split('/')[1].toLowerCase();
    if (!this.allowedExt.includes(ext)) {
      throw new BadRequestException(
        '허용되지않는 확장자(jpg, jpeg, png, gif만 허용가능)',
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `최대 파일 크기 초과: ${this.maxSize / (1024 * 1024)}MB까지 허용가능`,
      );
    }

    return file;
  }
}
