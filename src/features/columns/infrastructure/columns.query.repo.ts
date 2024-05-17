import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { ColumnViewOutputModel } from '../models/output/column.view.output.model';
import { NodeEnv } from '../../../base/enums/node-env.enum';

@Injectable()
export class ColumnsQueryRepository {
  private readonly logger = new Logger(ColumnsQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async findColumnById(id: string): Promise<ColumnViewOutputModel | null> {
    try {
      const post = await this.prismaClient.column.findUnique({
        where: { id },
      });

      return await this.columnMapper(post);
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  private async columnMapper(data): Promise<ColumnViewOutputModel> {
    return {
      id: data.id,
      title: data.title,
      description: data?.description || null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
