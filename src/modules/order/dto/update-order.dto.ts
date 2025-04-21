import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { OrderStatus } from '../order.interface';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
@InputType()
export class FilterOrderDto {
  @Field(() => OrderStatus, { nullable: true })
  @IsString()
  @MinLength(3)
  @IsOptional()
  status?: OrderStatus;
}
