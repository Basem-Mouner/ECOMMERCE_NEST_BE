import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartRepositoryService } from 'src/DB/repository/cart.repository.service';
import { OrderRepositoryService } from 'src/DB/repository/order.repository.service';
import { CartService } from '../cart/cart.service';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { UserModel } from 'src/DB/models/user.model';
import { CartModel } from 'src/DB/models/cart.model';
import { OrderModel } from 'src/DB/models/order.model';
import { ProductModel } from 'src/DB/models/product.model';
import { ProductRepositoryService } from 'src/DB/repository/product.repository.service';
import { TokenService } from 'src/common/security/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { PaymentService } from 'src/common/services/payment.service';
import { RealTimeGateway } from '../gateway/gateway';
import { OrderResolver } from './order.resolver';

@Module({
  imports: [UserModel, CartModel, OrderModel, ProductModel],
  controllers: [OrderController],
  providers: [
    OrderService,
    CartRepositoryService,
    UserRepositoryService,
    OrderRepositoryService,
    ProductRepositoryService,
    CartService,
    TokenService,
    JwtService,
    PaymentService,
    RealTimeGateway,
    OrderResolver,
  ],
})
export class OrderModule {}
