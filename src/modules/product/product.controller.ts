import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorators/user.decorators';
import {
  CreateProductDto,
  createProductFileDto,
} from './dto/create.product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerCloudOptions } from 'src/common/multer/multer.cloud.option';
import { fileValidationTypes } from 'src/common/interfaces/fileValidationTypes';
import {
  productIdDto,
  updateProductDto,
  updateProductFileDto,
} from './dto/update.dto';
import { findProductFilterDto } from './dto/find.product.dto';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  }),
)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      multerCloudOptions({
        fileValidation: fileValidationTypes.image,
        fileSize: 1024 * 1024 * 50,
      }),
    ),
  )
  @Post()
  @Auth([RoleTypes.admin])
  create(
    @Body() body: CreateProductDto,
    @UploadedFiles()
    files: createProductFileDto,
    @User() user: UserDocument,
  ) {
    // console.log({ body, f1: files?.image, f2: files?.gallery, user });
    return this.productService.create(body, files, user);
  }
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
      ],
      multerCloudOptions({
        fileValidation: fileValidationTypes.image,
        fileSize: 1024 * 1024 * 50,
      }),
    ),
  )
  @Patch(':productId')
  @Auth([RoleTypes.admin])
  update(
    @Body() body: updateProductDto,
    @Param() params: productIdDto,
    @UploadedFiles()
    files: updateProductFileDto,
    @User() user: UserDocument,
  ) {
    // console.log({ body, f1: files?.image, f2: files?.gallery, user });
    return this.productService.updateProduct(
      body,
      files,
      user,
      params.productId,
    );
  }
  @UseInterceptors(CacheInterceptor) //only valid for get method
  @CacheTTL(5) //cash time to live have permission to override the global cache time by seconds
  @Get()
  @Auth([...Object.values(RoleTypes)])
  listFilter(@Query() query: findProductFilterDto) {
    return this.productService.listFilter(query);
  }
}
