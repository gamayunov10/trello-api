import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { ColumnInputModel } from '../models/input/column-input.model';
import { NodeEnv } from '../../../base/enums/node-env.enum';

@Injectable()
export class ColumnsRepository {
  private readonly logger = new Logger(ColumnsRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async createColumn(columnInputModel: ColumnInputModel, userId: string) {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const createdColumn = await prisma.column.create({
          data: {
            title: columnInputModel.title,
            description: columnInputModel?.description,
            authorId: userId,
          },
        });

        return createdColumn.id;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return false;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
