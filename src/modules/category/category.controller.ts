import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/multer/multer.local.option';
import { multerCloudOptions } from 'src/common/multer/multer.cloud.option';
import { fileValidationTypes } from 'src/common/interfaces/fileValidationTypes';
import { User } from 'src/common/decorators/user.decorators';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { CategoryId, UpdateCategoryDTO } from './dto/update.dto';
import { FilterQuery, Types } from 'mongoose';
import { CategoryDocument } from 'src/DB/models/category.model';
import { findCategoryFilterDto } from './dto/find.category.dto';
import { MulterValidationInterceptor } from 'src/common/multer/multer-validation/multer-validation.interceptor';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false, // This is important to ensure that all errors are returned if true and not just the first error
  }),
)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  //___________________________________
  @Auth([RoleTypes.admin])
  @UseInterceptors(
    FileInterceptor(
      'file',
      // multerOptions({
      //   fileValidation: ['image/jpeg', 'image/png', 'image/jpg'],
      //   destinationFolder: 'category',
      //   filePrefix: 'logo',
      // }),
      multerCloudOptions({
        fileValidation: fileValidationTypes.image,
      }),
    ),
    MulterValidationInterceptor,
  )
  @Post()
  createCategory(
    @User() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(user, file, body);
  }

  //___________________________________

  @Auth([RoleTypes.admin])
  @UseInterceptors(
    FileInterceptor(
      'file',
      multerCloudOptions({
        fileValidation: fileValidationTypes.image,
      }),
    ),
  )
  @Patch(':categoryId')
  updateCategory(
    @User() user: UserDocument,
    @Param() params: CategoryId,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateCategoryDTO,
  ) {
    return this.categoryService.updateCategory(
      user,
      params.categoryId,
      file,
      body,
    );
  }

  @Get('')
  List(@Query() query: findCategoryFilterDto) {
    return this.categoryService.listCategories(query);
  }
}
