import { Resolver } from '@nestjs/graphql';
import { Args, Mutation, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { OneOrderResponse } from './entities/order.entity';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { FilterOrderDto } from './dto/update-order.dto';
import { AuthenticationGuard } from 'src/common/guard/authentication/authentication.guard';
import { User } from 'src/common/decorators/user.decorators';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  }),
)
@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}
  @Auth([RoleTypes.user])
  @Query(() => [OneOrderResponse], {
    name: 'allOrders',
    description: 'Get all orders',
  })
  async getOrder(
    @User() user: UserDocument,
    @Args('inputFilter', { nullable: true }) filterOrder?: FilterOrderDto,
  ): Promise<OneOrderResponse[]> {
    const orders = await this.orderService.findAllOrder();
    // console.log({ user });

    return orders;
  }
  //   @Mutation(() => String)
  //   async createOrder(@Args('input') input: any): Promise<string> {
  //     // Logic to create a new order
  //     return `Order created with input: ${JSON.stringify(input)}`;
  //   }
  //   @Mutation(() => String)
  //   async updateOrder(
  //     @Args('id') id: string,
  //     @Args('input') input: any,
  //   ): Promise<string> {
  //     // Logic to update an existing order
  //     return `Order with ID: ${id} updated with input: ${JSON.stringify(input)}`;
  //   }
}
