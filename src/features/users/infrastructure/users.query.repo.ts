import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';

@Injectable()
export class UsersQueryRepository {
  private readonly logger = new Logger(UsersQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async findUserById(id: string) {
    try {
      return this.prismaClient.user.findUnique({
        where: { id },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserByEmail(email: string) {
    try {
      return this.prismaClient.user.findUnique({
        where: { email },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findPasswordRecoveryRecord(code: string) {
    try {
      return this.prismaClient.passwordRecoveryCode.findUnique({
        where: { recoveryCode: code },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserProviderInfo(userId: string) {
    try {
      return this.prismaClient.userProviderInfo.findMany({
        where: { userId: userId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserByEmailConfirmationCode(confirmationCode: string) {
    try {
      return this.prismaClient.user.findFirst({
        where: {
          confirmationCode: {
            confirmationCode: confirmationCode,
          },
        },
        include: {
          confirmationCode: true,
        },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
