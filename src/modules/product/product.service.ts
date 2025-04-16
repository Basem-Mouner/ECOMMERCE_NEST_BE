import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDocument } from 'src/DB/models/user.model';
import {
  CreateProductDto,
  createProductFileDto,
} from './dto/create.product.dto';
import { ProductRepositoryService } from 'src/DB/repository/product.repository.service';
import { CategoryRepositoryService } from 'src/DB/repository/category.repository.service';
import { CloudService } from 'src/common/multer/cloud.service';
import { IAttachmentType } from '../category/category.interface';
import { IProduct } from './product.interface';
import { updateProductDto, updateProductFileDto } from './dto/update.dto';
import { FilterQuery, Types } from 'mongoose';
import { CategoryDocument } from 'src/DB/models/category.model';
import { findProductFilterDto } from './dto/find.product.dto';
import { ProductDocument } from 'src/DB/models/product.model';
import { IPagination } from 'src/DB/repository/DataBase.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepositoryService: ProductRepositoryService,
    private readonly categoryRepositoryService: CategoryRepositoryService,
    private readonly cloudService: CloudService,
  ) {}
  async create(
    body: CreateProductDto,
    files: createProductFileDto,
    user: UserDocument,
  ): Promise<{ message: string; data: Partial<IProduct> }> {
    console.log({ files });

    if (!files.image) {
      throw new BadRequestException('image is required');
    }
    const category = await this.categoryRepositoryService.findOne({
      filter: { _id: body.categoryId },
    });
    if (!category) {
      throw new BadRequestException('category not found');
    }

    const folderId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const { public_id, secure_url } = await this.cloudService.uploadFile(
      files.image[0].path,
      {
        folder: `${process.env.APP_NAME}/category/${category.folderId}/product/${folderId}/image`,
      },
    );
    const image: IAttachmentType = { public_id, secure_url };
    let gallery: IAttachmentType[] = [];
    if (files.gallery) {
      gallery = await this.cloudService.uploadFiles(files.gallery, {
        folder: `${process.env.APP_NAME}/category/${category.folderId}/product/${folderId}/gallery`,
      });
    }

    const finalPrice = this.calculateFinalPrice(
      body.originalPrice,
      body.discountPercent || 0,
    );

    const product = await this.productRepositoryService.create({
      ...body,
      image,
      gallery,
      folderId,
      createdBy: user._id,
      //   finalPrice,
    });
    return { message: 'Product created successfully', data: product };
  }

  async updateProduct(
    body: updateProductDto,
    files: updateProductFileDto,
    user: UserDocument,
    productId: Types.ObjectId,
  ): Promise<{ message: string }> {
    const product = await this.productRepositoryService.findOne({
      filter: { _id: productId },
      populate: [{ path: 'categoryId' }],
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.createdBy.toString() !== user._id.toString()) {
      throw new BadRequestException(
        'You are not authorized to update this product',
      );
    }

    if (body.categoryId) {
      const category = await this.categoryRepositoryService.findOne({
        filter: { _id: body.categoryId },
      });
      if (!category) {
        throw new BadRequestException('category not found');
      }
    }

    let image: IAttachmentType = product.image;
    if (files?.image) {
      const { public_id, secure_url } = await this.cloudService.uploadFile(
        files.image[0].path,
        {
          folder: `${process.env.APP_NAME}/category/${product.categoryId['folderId']}/product/${product.folderId}/image`,
        },
      );
      image = { public_id, secure_url };
    }
    let gallery: IAttachmentType[] = product.gallery || [];
    if (files?.gallery?.length) {
      gallery = await this.cloudService.uploadFiles(files.gallery, {
        folder: `${process.env.APP_NAME}/category/${product.categoryId['folderId']}/product/${product.folderId}/gallery`,
      });
    }
    let finalPrice: number = product.finalPrice;
    if (body.originalPrice || body.discountPercent) {
      finalPrice = this.calculateFinalPrice(
        body.originalPrice || product.originalPrice,
        body.discountPercent || product.discountPercent || 0,
      );
    }

    const updatedProduct = await this.productRepositoryService.updateOne({
      filter: { _id: productId },
      updatedData: {
        ...body,
        image,
        gallery,
        finalPrice,
      },
    });
    if (updatedProduct.modifiedCount && files?.image) {
      await this.cloudService.destroyFile(product.image.public_id);
    }
    if (
      updatedProduct.modifiedCount &&
      files?.gallery?.length &&
      product?.gallery?.length
    ) {
      const ids: string[] = product.gallery.map(
        (item: IAttachmentType) => item.public_id,
      );
      await this.cloudService.destroyFiles(ids);
      //to destroy folder
      //   await this.cloudService.destroyFolderAssets(
      //     `${process.env.APP_NAME}/category/${product.categoryId['folderId']}/product/${product.folderId}/gallery/`,
      //   );
    }

    return { message: 'Product updated successfully' };
  }

  async listFilter(query: findProductFilterDto): Promise<{
    message: string;
    data: { products: [] | ProductDocument[] | IPagination<ProductDocument> };
  }> {
    let filter: FilterQuery<ProductDocument> = {};
    if (query?.name) {
      filter = {
        $or: [
          { name: { $regex: `${query.name}`, $options: 'i' } },
          { slug: { $regex: `${query.name}`, $options: 'i' } },
        ],
      };
    }
    if (query.categoryId) {
      if (
        !(await this.categoryRepositoryService.exists({
          filter: { _id: query.categoryId },
        }))
      ) {
        throw new BadRequestException('Category not found');
      }
      filter = { ...filter, categoryId: query.categoryId };
    }
    if (query?.minPrice || query?.maxPrice) {
      const max = query.maxPrice ? { $lte: query.maxPrice } : {};
      filter.finalPrice = { $gte: query.minPrice || 0, ...max };
    }
    const products = await this.productRepositoryService.findAll({
      filter,
      limit: query.limit,
      select: query.select,
      sort: query.sort,
      page: query.page,
      populate: [{ path: 'categoryId' }],
    });

    return { message: 'Products found successfully', data: { products } };
  }

  private calculateFinalPrice(
    originalPrice: number,
    discountPercent: number,
  ): number {
    const price =
      originalPrice - ((discountPercent || 0) * originalPrice) / 100;
    return price > 0 ? price : 0;
  }
}
