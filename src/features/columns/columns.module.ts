import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';

import { ColumnsController } from './api/columns.controller';
import { ColumnsRepository } from './infrastructure/columns.repo';
import { ColumnsQueryRepository } from './infrastructure/columns.query.repo';
import { CreateColumnUseCase } from './api/application/use-cases/column-create.use.case';

const services = [PrismaClient, JwtService];
const useCases = [CreateColumnUseCase];
const repositories = [ColumnsRepository];
const queryRepositories = [ColumnsQueryRepository, UsersQueryRepository];

@Module({
  imports: [CqrsModule],
  controllers: [ColumnsController],
  providers: [...repositories, ...queryRepositories, ...services, ...useCases],
})
export class ColumnsModule {}
