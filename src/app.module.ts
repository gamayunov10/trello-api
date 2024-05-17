import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { AppService } from './app.service';
import { PrismaService } from './base/database/prisma/prisma.service';
import { AppController } from './app.controller';
import { TestingController } from './testing/testing.controller';

const services = [AppService, PrismaClient, PrismaService];
const modules = [];
const controllers = [AppController, TestingController];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...modules,
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class AppModule {}
