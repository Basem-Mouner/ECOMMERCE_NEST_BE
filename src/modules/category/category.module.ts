import { BadRequestException, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import {
  Category,
  CategoryModel,
  CategorySchema,
} from 'src/DB/models/category.model';
import { CategoryRepositoryService } from 'src/DB/repository/category.repository.service';
import { TokenService } from 'src/common/security/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { UserModel } from 'src/DB/models/user.model';
import { MulterModule } from '@nestjs/platform-express';
import { resolve } from 'path';
import { diskStorage } from 'multer';
import { CloudService } from 'src/common/multer/cloud.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    CategoryModel,
    UserModel,
    // MulterModule.register({
    //   storage: diskStorage({
    //     destination: (req, file, cb) => {
    //       cb(null, resolve('./upload'));
    //     },
    //     filename: (req, file, cb) => {
    //       cb(null, Date.now() + '_' + file.originalname);
    //     },
    //   }),
    //   fileFilter: (req, file, cb) => {
    //     if (!['image/jpeg'].includes(file.mimetype)) {
    //       return cb(new BadRequestException('Invalid file format'), false);
    //     }
    //     cb(null, true);
    //   },
    //   limits: {
    //     fileSize: 1024 * 1024 * 5,
    //   },
    // }),
  ],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    UserRepositoryService,
    CategoryRepositoryService,
    TokenService,
    JwtService,
    CloudService,
  ],
})
export class CategoryModule {}
