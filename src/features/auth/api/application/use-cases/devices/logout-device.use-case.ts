import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  deviceIDField,
  deviceNotFound,
} from '../../../../../../base/constants/constants';
import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';
import { UserDevicesQueryRepository } from '../../../../../users/infrastructure/devices/user.devices.query.repo';

export class LogoutDeviceCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutDeviceCommand)
export class LogoutDeviceUseCase
  implements ICommandHandler<LogoutDeviceCommand>
{
  constructor(
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly devicesQueryRepository: UserDevicesQueryRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(
    command: LogoutDeviceCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const decodedToken = await this.jwtService.decode(command.token);

    const device = await this.devicesQueryRepository.findDeviceByDeviceId(
      decodedToken.deviceId,
    );

    if (!device) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: deviceIDField,
        message: deviceNotFound,
      };
    }

    await this.userDevicesRepository.deleteUserDevices(
      decodedToken.userId,
      decodedToken.deviceId,
    );

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
