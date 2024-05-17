import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { AppService } from './app.service';
import { PrismaService } from './base/database/prisma/prisma.service';
import { UsersModule } from './features/users/users.module';
import { MailModule } from './features/mail/mail.module';
import { AppController } from './app.controller';
import { TestingController } from './testing/testing.controller';
import { AuthModule } from './features/auth/auth.module';
import { ColumnsModule } from './features/columns/columns.module';

const services = [AppService, PrismaClient, PrismaService];
const modules = [UsersModule, AuthModule, MailModule, ColumnsModule];
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
