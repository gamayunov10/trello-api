import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';

export class TerminateOtherSessionsCommand {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {}
}

@CommandHandler(TerminateOtherSessionsCommand)
export class TerminateOtherSessionsUseCase
  implements ICommandHandler<TerminateOtherSessionsCommand>
{
  constructor(private readonly userDevicesRepository: UserDevicesRepository) {}

  async execute(command: TerminateOtherSessionsCommand): Promise<boolean> {
    return this.userDevicesRepository.deleteOthers(command.deviceId);
  }
}
