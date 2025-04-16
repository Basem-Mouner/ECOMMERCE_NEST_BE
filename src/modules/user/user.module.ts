import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel } from 'src/DB/models/user.model';
import { TokenService } from 'src/common/security/service/token.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { HeaderValidateMiddleware } from 'src/common/middleware/service/header.validate.service.middleware';
import { setLanguage } from 'src/common/middleware/function/language.function.middleware';

@Module({
  imports: [UserModel],
  controllers: [UserController],
  providers: [UserService, TokenService, JwtService, UserRepositoryService],
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(HeaderValidateMiddleware).forRoutes('user');
    consumer.apply(setLanguage).forRoutes('user');

    // consumer.apply(HeaderValidateMiddleware).forRoutes(UserController);
    // consumer.apply(HeaderValidateMiddleware).forRoutes({
    //   path: 'user/profile',
    //   method: RequestMethod.GET,
    // });

    // consumer.apply(HeaderValidateMiddleware).exclude({
    //   path: 'user/profile',
    //   method: RequestMethod.GET,
    // });
  }
}
