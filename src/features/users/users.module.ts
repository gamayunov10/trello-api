import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UserController } from './api/user.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { UserDevicesQueryRepository } from './infrastructure/devices/user.devices.query.repo';

const services = [PrismaClient, JwtService];
const useCases = [];
const repositories = [UsersRepository];
const queryRepositories = [UsersQueryRepository, UserDevicesQueryRepository];

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [...repositories, ...queryRepositories, ...services, ...useCases],
})
export class UsersModule {}
