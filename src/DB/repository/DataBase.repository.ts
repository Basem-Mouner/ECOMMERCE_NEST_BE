import {
  FilterQuery,
  Model,
  PopulateOptions,
  Types,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
export interface IPagination<T> {
  countItems: number;
  itemPerPage: number;
  totalPages: number;
  currentPage: number;
  documents: T[];
}
export abstract class DataBaseRepository<TDocument> {
  protected constructor(protected readonly model: Model<TDocument>) {}
  // 🔹 Create a new document
  async create(data: Partial<TDocument>): Promise<Partial<TDocument>> {
    return await this.model.create(data);
  }
  // 🔹 Find one document
  async findOne({
    filter,
    populate,
  }: {
    filter?: FilterQuery<TDocument>;
    populate?: PopulateOptions[];
  }): Promise<TDocument | null> {
    return await this.model.findOne(filter || {}).populate(populate || []);
  }
  // 🔹 Find multiple documents
  // async findAll({
  //   filter,
  //   populate,
  //   limit,
  //   skip,
  //   select,
  //   page,
  //   sort,
  // }: {
  //   filter?: FilterQuery<TDocument>;
  //   populate?: PopulateOptions[];
  //   limit?: number;
  //   skip?: number;
  //   select?: string;
  //   page?: number; // ✅ Page number
  //   sort?: Record<string, 1 | -1>; // ✅ Sorting (1 for ascending, -1 for descending)
  // }): Promise<TDocument[] | []> {
  //   const actualSkip = page && limit ? (page - 1) * limit : skip || 0; // ✅ Calculate skip based on page
  //   return await this.model
  //     .find(filter || {})
  //     .select(select || '')
  //     .populate(populate || [])
  //     .sort(sort || {}) // ✅ Apply sorting
  //     .limit(limit || 0)
  //     .skip(actualSkip); // ✅ Apply skip (pagination logic)
  // }
  // 🔹 Find multiple documents
  async findAll({
    filter,
    populate,
    limit = 2,
    select,
    page,
    sort,
  }: {
    filter?: FilterQuery<TDocument>;
    populate?: PopulateOptions[];
    limit?: number;
    select?: string;
    page?: number; // ✅ Page number
    sort?: string; // ✅ Sorting (1 for ascending, -1 for descending)
  }): Promise<TDocument[] | [] | IPagination<TDocument>> {
    // const actualSkip = page && limit ? (page - 1) * limit : skip || 0; // ✅ Calculate skip based on page
    let query = this.model.find(filter || {});

    if (select) {
      select = select.replaceAll(',', ' ');
      query = query.select(select);
    }
    if (sort) {
      sort = sort.replaceAll(',', ' ');
      query = query.sort(sort);
    }
    if (populate) {
      query = query.populate(populate);
    }
    if (!page) {
      return query.exec();
    }
    //if we have page
    const count = await this.model.countDocuments(filter || {});
    const skip = (page - 1) * limit; // ✅ Calculate skip based on page
    const pages = Math.ceil(count / limit);
    const documents = await query.skip(skip).limit(limit).exec();
    return {
      countItems: count,
      itemPerPage: limit,
      totalPages: pages,
      currentPage: page,
      documents,
    };
  }
  // 🔹 find by id
  async findById({
    id,
    populate,
  }: {
    id: Types.ObjectId;
    populate?: PopulateOptions[];
  }): Promise<TDocument | null> {
    return await this.model.findById(id).populate(populate || []);
  }

  // 🔹 Update a document
  async updateOne({
    filter,
    updatedData,
  }: {
    filter: FilterQuery<TDocument>;
    updatedData: UpdateQuery<TDocument>;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(filter, updatedData, {
      new: true,
    });
  }

  // 🔹 Find one and Update a document
  async findOneAndUpdate({
    filter,
    updatedData,
  }: {
    filter: FilterQuery<TDocument>;
    updatedData: UpdateQuery<TDocument>;
  }): Promise<TDocument | null> {
    return await this.model.findOneAndUpdate(filter, updatedData, {
      new: true,
    });
  }

  // 🔹 Update multiple documents
  async updateMany({
    filter,
    update,
  }: {
    filter: FilterQuery<TDocument>;
    update: UpdateQuery<TDocument>;
  }): Promise<{ modifiedCount: number }> {
    const result = await this.model.updateMany(filter, update);
    return { modifiedCount: result.modifiedCount };
  }

  // 🔹 Delete a document
  async deleteOne({
    filter,
  }: {
    filter: FilterQuery<TDocument>;
  }): Promise<boolean> {
    const result = await this.model.deleteOne(filter);
    return result.deletedCount > 0;
  }

  // 🔹 Delete multiple documents
  async deleteMany({
    filter,
  }: {
    filter: FilterQuery<TDocument>;
  }): Promise<number> {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount;
  }

  // 🔹 Count documents
  async count({
    filter,
  }: {
    filter?: FilterQuery<TDocument>;
  }): Promise<number> {
    return await this.model.countDocuments(filter || {});
  }

  // 🔹 Check if a document exists
  async exists({
    filter,
  }: {
    filter: FilterQuery<TDocument>;
  }): Promise<boolean> {
    return (await this.model.exists(filter)) !== null;
  }
}
