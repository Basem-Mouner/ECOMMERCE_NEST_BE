import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorators/user.decorators';
import { AddCartDto } from './dto/addCart.dto';
import { ItemIdsDTO } from './dto/update.cart.dto';
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  }),
)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Auth([RoleTypes.user])
  @Post()
  addToCart(@User() user: UserDocument, @Body() body: AddCartDto) {
    return this.cartService.addToCart(user, body);
  }

  @Auth([RoleTypes.user])
  @Patch()
  removeItemFromCart(@User() user: UserDocument, @Body() body: ItemIdsDTO) {
    return this.cartService.removeItemFromCart(user, body);
  }

  @Auth([RoleTypes.user])
  @Delete()
  clearCart(@User() user: UserDocument) {
    return this.cartService.clearCart(user);
  }
  @Auth([RoleTypes.user])
  @Get()
  getCart(@User() user: UserDocument) {
    return this.cartService.getCart(user);
  }
}
