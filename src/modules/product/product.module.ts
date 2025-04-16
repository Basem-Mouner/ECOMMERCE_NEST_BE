import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepositoryService } from 'src/DB/repository/product.repository.service';
import { ProductModel } from 'src/DB/models/product.model';
import { CategoryRepositoryService } from 'src/DB/repository/category.repository.service';
import { CategoryModel } from 'src/DB/models/category.model';
import { TokenService } from 'src/common/security/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { CloudService } from 'src/common/multer/cloud.service';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { UserModel } from 'src/DB/models/user.model';

@Module({
  imports: [UserModel, ProductModel, CategoryModel],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepositoryService,
    CategoryRepositoryService,
    UserRepositoryService,
    TokenService,
    JwtService,
    CloudService,
  ],
})
export class ProductModule {}
