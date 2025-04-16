import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDocument } from 'src/DB/models/user.model';
import { CategoryRepositoryService } from 'src/DB/repository/category.repository.service';
import { CloudService } from 'src/common/multer/cloud.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { IAttachmentType, ICategory } from './category.interface';
import { UpdateCategoryDTO } from './dto/update.dto';
import { FilterQuery, Types } from 'mongoose';
import { CategoryDocument } from 'src/DB/models/category.model';
import { IPagination } from 'src/DB/repository/DataBase.repository';
import { findCategoryFilterDto } from './dto/find.category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepositoryService: CategoryRepositoryService,
    private readonly cloudService: CloudService,
  ) {}
  async createCategory(
    user: UserDocument,
    file: Express.Multer.File,
    body: CreateCategoryDto,
  ): Promise<{ message: string; data?: any }> {
    console.log({ file, body, user });
    const { name } = body;
    if (await this.categoryRepositoryService.exists({ filter: { name } })) {
      throw new ConflictException(`Category ${name} already exists`);
    }

    const folderId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const { public_id, secure_url }: IAttachmentType =
      await this.cloudService.uploadFile(file.path, {
        folder: `${process.env.APP_NAME}/category/${folderId}`,
      });
    await this.categoryRepositoryService.create({
      name,
      folderId,
      catImage: { public_id, secure_url },
      createdBy: user._id,
    });
    return {
      message: `Category ${name} created successfully`,
      // data: { name, folderId, catImage: { public_id, secure_url } },
    };
  }

  async updateCategory(
    user: UserDocument,
    categoryId: Types.ObjectId,
    file: Express.Multer.File,
    body: UpdateCategoryDTO,
  ): Promise<{ message: string; data?: any }> {
    const category = await this.categoryRepositoryService.findOne({
      filter: { _id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (!body && !file) {
      throw new BadRequestException('In-valid provided data');
    }
    const { name } = body;
    if (
      name &&
      (await this.categoryRepositoryService.exists({
        filter: { name, _id: { $ne: categoryId } },
      }))
    ) {
      throw new ConflictException('this category name already exists');
    }
    let logo: IAttachmentType = category.catImage;
    if (file) {
      const { public_id, secure_url }: IAttachmentType =
        await this.cloudService.uploadFile(file.path, {
          folder: `${process.env.APP_NAME}/category/${category.folderId}`,
        });
      logo = { public_id, secure_url };
    }
    const updatedCategory = await this.categoryRepositoryService.updateOne({
      filter: { _id: categoryId },
      updatedData: { catImage: logo, name },
    });
    if (updatedCategory.modifiedCount && file) {
      await this.cloudService.destroyFile(category.catImage.public_id);
    }

    return {
      message: `Category  updated successfully`,
      // data: { name, folderId, catImage: { public_id, secure_url } },
    };
  }

  async findById(
    categoryId: Types.ObjectId,
  ): Promise<{ message: string; data: { category: ICategory } }> {
    const category = await this.categoryRepositoryService.findById({
      id: categoryId,
      populate: [{ path: 'createdBy', select: 'firstName lastName userName' }],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      message: `Done`,
      data: { category },
    };
  }

  async listCategories(query: findCategoryFilterDto): Promise<{
    message: string;
    data: ICategory[] | [] | IPagination<ICategory>;
  }> {
    let filter: FilterQuery<CategoryDocument> = {};
    if (query?.name) {
      filter = {
        $or: [
          { name: { $regex: `${query.name}`, $options: 'i' } },
          { slug: { $regex: `${query.name}`, $options: 'i' } },
        ],
      };
    }
    const categories = await this.categoryRepositoryService.findAll({
      filter,
      select: query.select,
      sort: query.sort,
      page: query.page,
      populate: [{ path: 'createdBy', select: 'firstName lastName userName' }],
    });
    return { message: `Done`, data: categories };
  }
}
