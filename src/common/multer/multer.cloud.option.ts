import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

// 📜 ------------------------------------------------------------------------

export const multerCloudOptions = ({
  fileValidation = [],
  fileSize = 5 * 1024 * 1024,
}: {
  fileValidation?: string[];
  fileSize?: number;
}) => {
  return {
    storage: diskStorage({}),
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
      if (!fileValidation.includes(file.mimetype)) {
        return cb(new BadRequestException('Invalid file format'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize, // Limit file size to 5MB
    },
  };
};
