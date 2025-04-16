import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModel } from 'src/DB/models/user.model';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common/security/service/token.service';
// import { EmailService } from 'src/common/events/emailEvent';

@Module({
  imports: [UserModel],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepositoryService,
    JwtService,
    TokenService,
    // EmailService,
  ],
  exports: [UserRepositoryService], // Export if needed in other modules
})
export class AuthenticationModule {}
