import { Injectable } from '@nestjs/common';
import { DataBaseRepository } from './DataBase.repository';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../models/product.model';
import path from 'path';

export const productPopulateList = [
  { path: 'createdBy' },
  { path: 'categoryId' },
];
@Injectable()
export class ProductRepositoryService extends DataBaseRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }
}
