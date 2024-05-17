import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';

export class LoginDeviceCommand {
  constructor(
    public token: string,
    public ip: string,
    public userAgent: string,
  ) {}
}

@CommandHandler(LoginDeviceCommand)
export class LoginDeviceUseCase implements ICommandHandler<LoginDeviceCommand> {
  constructor(
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: LoginDeviceCommand): Promise<string> {
    const decodedToken = await this.jwtService.decode(command.token);

    return await this.userDevicesRepository.createDevice(
      decodedToken,
      command.ip,
      command.userAgent,
    );
  }
}
