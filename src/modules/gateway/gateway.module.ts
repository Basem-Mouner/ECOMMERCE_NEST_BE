import { Module } from '@nestjs/common';
import { RealTimeGateway } from './gateway';
import { TokenService } from 'src/common/security/service/token.service';
import { UserModel } from 'src/DB/models/user.model';
import { UserRepositoryService } from 'src/DB/repository/user.repository.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModel],
  controllers: [],
  providers: [RealTimeGateway, UserRepositoryService, JwtService, TokenService],
})
export class GatewayModule {}
