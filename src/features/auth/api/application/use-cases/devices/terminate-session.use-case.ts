import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  deviceIDField,
  deviceNotFound,
} from '../../../../../../base/constants/constants';
import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';
import { UserDevicesQueryRepository } from '../../../../../users/infrastructure/devices/user.devices.query.repo';

export class TerminateSessionCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(TerminateSessionCommand)
export class TerminateSessionUseCase
  implements ICommandHandler<TerminateSessionCommand>
{
  constructor(
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly userDevicesQueryRepository: UserDevicesQueryRepository,
  ) {}

  async execute(
    command: TerminateSessionCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const deviceByParam =
      await this.userDevicesQueryRepository.findDeviceByDeviceId(
        command.deviceId,
      );

    const deviceByToken =
      await this.userDevicesQueryRepository.findDeviceByUserId(command.userId);

    if (!deviceByParam || !deviceByToken) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    if (deviceByToken.userId !== deviceByParam.userId) {
      throw new ForbiddenException();
    }

    await this.userDevicesRepository.deleteDevice(command.deviceId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
