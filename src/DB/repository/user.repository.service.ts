import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../models/user.model';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { DataBaseRepository } from './DataBase.repository';

@Injectable()
export class UserRepositoryService extends DataBaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async checkDuplicateAccount(data: FilterQuery<UserDocument>): Promise<null> {
    const checkUser = await this.findOne({
      filter: data,
    });

    if (checkUser) {
      throw new ConflictException('Email already exists');
    }

    return null;
  }

  //   async create({
  //     data,
  //   }: {
  //     data: Partial<UserDocument>;
  //   }): Promise<Partial<UserDocument>> {
  //     return await this.userModel.create(data);
  //   }

  //   async findOne({
  //     filter,
  //     populate,
  //   }: {
  //     filter?: FilterQuery<UserDocument>;
  //     populate?: PopulateOptions[];
  //   }): Promise<UserDocument | null> {
  //     return await this.userModel.findOne(filter || {}).populate(populate || []);
  //   }
}
