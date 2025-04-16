import { Injectable } from '@nestjs/common';
import { DataBaseRepository } from './DataBase.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from '../models/cart.model';
import { Order } from '../models/order.model';

@Injectable()
export class OrderRepositoryService<
  TDocument,
> extends DataBaseRepository<TDocument> {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<TDocument>,
  ) {
    super(orderModel);
  }
}
