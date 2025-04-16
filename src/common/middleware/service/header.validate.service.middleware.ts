import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HeaderValidateMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Hi middleware');

    if (
      !req.headers.authorization ||
      req.headers.authorization.split(' ').length !== 2
    ) {
      return res.status(400).json({ message: 'Missing authorization' });
    }

    return next();
  }
}
