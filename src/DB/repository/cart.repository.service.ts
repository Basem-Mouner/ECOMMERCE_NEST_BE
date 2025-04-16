import { Injectable } from '@nestjs/common';
import { DataBaseRepository } from './DataBase.repository';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from '../models/cart.model';

@Injectable()
export class CartRepositoryService<
  TDocument,
> extends DataBaseRepository<TDocument> {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<TDocument>,
  ) {
    super(cartModel);
  }
}
