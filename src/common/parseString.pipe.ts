import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Bad Request');
    }

    return value;
  }
}
