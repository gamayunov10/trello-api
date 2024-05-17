import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { UserAuthInputModel } from '../../auth/models/input/user-auth.input.model';
import { UserOauthCredInputModel } from '../../auth/models/input/user-oauth-cred.input.model';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(
    userAuthInputModel: UserAuthInputModel,
    hash: string,
    confirmationCode: string,
  ): Promise<string> {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 1);

        const user = await prisma.user.create({
          data: {
            passwordHash: hash,
            email: userAuthInputModel.email,
          },
          select: {
            id: true,
          },
        });

        const userId = user.id;

        await prisma.confirmationCode.create({
          data: { userId, confirmationCode, expirationDate },
        });

        return userId;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async confirmUser(id: string): Promise<boolean> {
    try {
      const result = await this.prismaClient.$transaction(async (prisma) => {
        const updateUser = await prisma.user.update({
          where: { id },
          data: { isConfirmed: true },
        });

        const deleteConfirmation = await prisma.confirmationCode.delete({
          where: { userId: id },
        });

        return { updateUser, deleteConfirmation };
      });

      return !!(result.updateUser && result.deleteConfirmation);
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async updateUserProviderInfo(
    details: UserOauthCredInputModel,
    id: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.prismaClient.$transaction(async (prisma) => {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isConfirmed: true,
          },
        });

        await prisma.userProviderInfo.update({
          where: {
            id: id,
            provider: details.provider,
          },
          data: {
            provider: details.provider,
            userProviderId: details.userProviderId,
            userId: userId,
            displayName: details.displayName,
            email: details.email,
          },
        });
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async createUserByOAuth(details: UserOauthCredInputModel): Promise<User> {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const createdUser = await prisma.user.create({
          data: {
            email: details.email,
            passwordHash: null,
            isConfirmed: true,
          },
        });

        await prisma.userProviderInfo.create({
          data: {
            provider: details.provider,
            userProviderId: details.userProviderId,
            userId: createdUser.id,
            displayName: details.displayName,
            email: details.email,
          },
        });

        return createdUser;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async mergeUserProviderInfo(
    details: UserOauthCredInputModel,
    userId: string,
  ): Promise<void> {
    try {
      await this.prismaClient.$transaction(async (prisma) => {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            isConfirmed: true,
          },
        });

        await prisma.userProviderInfo.create({
          data: {
            provider: details.provider,
            userProviderId: details.userProviderId,
            userId: userId,
            displayName: details.displayName,
            email: details.email,
            city: details?.city ?? null,
          },
        });
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async createPasswordRecoveryRecord(id: string, recoveryCode: string) {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const createdRecord = await prisma.passwordRecoveryCode.create({
          data: {
            userId: id,
            recoveryCode: recoveryCode,
          },
          select: {
            id: true,
          },
        });

        return createdRecord.id;
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

  async updateEmailConfirmationCode(confirmationCode: string, userId: string) {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 5);

        const updateResult = await prisma.confirmationCode.update({
          where: {
            userId: userId,
          },
          data: {
            confirmationCode: confirmationCode,
            expirationDate: expirationDate,
          },
          select: {
            id: true,
          },
        });

        return !!updateResult;
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

  async updatePassword(userId: string, hash: string): Promise<boolean> {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const updateResult = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            passwordHash: hash,
          },
        });

        await prisma.passwordRecoveryCode.delete({
          where: {
            userId: userId,
          },
        });

        return !!updateResult;
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

  async deleteUser(userId: string): Promise<void> {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        await prisma.user.delete({
          where: { id: userId },
        });
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
