import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  SetMetadata,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  AuthenticationGuard,
  IAuthRequest,
} from 'src/common/guard/authentication/authentication.guard';
import { log } from 'console';
import { RoleTypes, UserDocument } from 'src/DB/models/user.model';
import { User } from 'src/common/decorators/user.decorators';
import { AuthorizationGuard } from 'src/common/guard/authorization/authorization.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { Auth } from 'src/common/decorators/auth.compose.decorator';
import { watchRequestInterceptor } from 'src/common/Interceptors/watch.interceptors';
import { delay, Observable, of } from 'rxjs';
// import { UpdateUserDto } from './dto/update-user.dto';

@UseInterceptors(watchRequestInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('profile')
  // // @SetMetadata('roles', [RoleTypes.user])
  // @Roles([RoleTypes.admin])
  // @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Auth([RoleTypes.user])
  profile(
    @Headers() header: any,
    @User() user: UserDocument,
  ): Observable<UserDocument> {
    console.log(header);

    // const user = req.user as UserDocument; // 🔹 Extract user properly

    // return this.userService.profile(user);
    return of(user).pipe(delay(100));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
