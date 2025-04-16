import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductRepositoryService } from 'src/DB/repository/product.repository.service';
import { CartRepositoryService } from 'src/DB/repository/cart.repository.service';
import { ProductModel } from 'src/DB/models/product.model';
import { CartModel } from 'src/DB/models/cart.model';
import { TokenService } from 'src/common/security/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { CloudService } from 'src/common/multer/cloud.service';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { UserModel } from 'src/DB/models/user.model';

@Module({
  imports: [UserModel, ProductModel, CartModel],
  controllers: [CartController],
  providers: [
    CartService,
    CartRepositoryService,
    ProductRepositoryService,
    UserRepositoryService,
    TokenService,
    JwtService,
    CloudService,
  ],
})
export class CartModule {}
