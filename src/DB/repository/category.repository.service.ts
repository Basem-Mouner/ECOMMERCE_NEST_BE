import { Injectable } from '@nestjs/common';
import { DataBaseRepository } from './DataBase.repository';
import { Category, CategoryDocument } from '../models/category.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CategoryRepositoryService extends DataBaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }
}
