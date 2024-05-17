import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnauthorizedException } from '@nestjs/common';

import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';
import { UserDevicesQueryRepository } from '../../../../../users/infrastructure/devices/user.devices.query.repo';

export class UpdateTokensCommand {
  constructor(
    public token: any,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(UpdateTokensCommand)
export class UpdateTokensUseCase
  implements ICommandHandler<UpdateTokensCommand>
{
  constructor(
    private readonly devicesRepository: UserDevicesRepository,
    private readonly devicesQueryRepository: UserDevicesQueryRepository,
  ) {}

  async execute(command: UpdateTokensCommand): Promise<void> {
    const device = await this.devicesQueryRepository.findDeviceByDeviceId(
      command.token.deviceId,
    );

    if (!device) {
      throw new UnauthorizedException();
    }

    return this.devicesRepository.updateDevice(
      device.id,
      command.token,
      command.ip,
      command.userAgent,
    );
  }
}
