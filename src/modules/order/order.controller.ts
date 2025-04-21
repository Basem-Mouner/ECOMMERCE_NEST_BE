import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderIdDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorators/user.decorators';
import { Request } from 'express';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  }),
)
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth([RoleTypes.user])
  @Post()
  create(@User() user: UserDocument, @Body() body: CreateOrderDto) {
    return this.orderService.create(user, body);
  }
  @Auth([RoleTypes.user])
  @Post('checkout/:orderId')
  checkout(@User() user: UserDocument, @Param() params: OrderIdDto) {
    return this.orderService.checkout(user, params.orderId);
  }

  @Post('webhook') //redirect from site stripe to this endpoint
  stripeWebhook(@Req() req: Request) {
    return this.orderService.stripeWebhook(req);
  }

  @Auth([RoleTypes.user])
  @Post('cancel/:orderId')
  cancelOrder(@User() user: UserDocument, @Param() params: OrderIdDto) {
    return this.orderService.cancelOrder(user, params.orderId);
  }

  @Get()
  findAllOrder() {
    return this.orderService.findAllOrder();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
