import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  sayHi(): string {
    return 'Hello in my E-commerce API app';
  }
}
