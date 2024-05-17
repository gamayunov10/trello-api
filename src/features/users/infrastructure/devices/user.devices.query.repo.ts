import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { NodeEnv } from '../../../../base/enums/node-env.enum';

@Injectable()
export class UserDevicesQueryRepository {
  private readonly logger = new Logger(UserDevicesQueryRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private prismaClient: PrismaClient,
  ) {}

  async findUserByDeviceId(userId: string, deviceId: string) {
    try {
      return this.prismaClient.deviceAuthSession.findFirst({
        where: { userId, deviceId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findDeviceByDeviceId(deviceId: string) {
    try {
      return this.prismaClient.deviceAuthSession.findFirst({
        where: { deviceId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findDeviceByUserId(userId: string) {
    try {
      return this.prismaClient.deviceAuthSession.findFirst({
        where: { userId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findActiveDevices(userId: string) {
    try {
      return this.prismaClient.deviceAuthSession.findMany({
        where: { userId },
        select: { deviceId: true, title: true, lastActiveDate: true },
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
