import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

// 📜 ------------------------------------------------------------------------

export const multerOptions = ({
  fileValidation = [],
  destinationFolder = 'uploads',
  filePrefix = 'file',
  fileSize = 5 * 1024 * 1024,
}: {
  fileValidation?: string[];
  destinationFolder?: string;
  filePrefix?: string;
  fileSize?: number;
}) => {
  const basePath = `uploads/${destinationFolder}`;

  return {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb) => {
        const fullPath = resolve(`./${basePath}/${req['user']._id}`);

        if (!existsSync(fullPath)) {
          mkdirSync(fullPath, { recursive: true });
        }

        cb(null, fullPath);
      },
      filename: (req: Request, file: Express.Multer.File, cb: any) => {
        const ext = extname(file.originalname); // Extract file extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        file['finalPath'] =
          basePath +
          '/' +
          `${req['user']._id}/` +
          `${filePrefix}-${uniqueSuffix}${ext}`;
        cb(null, `${filePrefix}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
      if (!fileValidation.includes(file.mimetype)) {
        return cb(new BadRequestException('Invalid file format'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
    },
  };
};
