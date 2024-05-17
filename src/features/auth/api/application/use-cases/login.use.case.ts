import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserLoginInputModel } from '../../../models/input/user-login.input.model';
import { AuthService } from '../auth.service';

import { CreateTokensCommand } from './tokens/create-token.use-case';
import { LoginDeviceCommand } from './devices/login-device.use-case';

export class LoginCommand {
  constructor(
    public userLoginInputModel: UserLoginInputModel,
    public userAgent: string,
    public ip: string,
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private readonly authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  async execute(command: LoginCommand) {
    const userId = await this.authService.checkCredentials(
      command.userLoginInputModel.email,
      command.userLoginInputModel.password,
    );

    if (!userId) {
      return false;
    }

    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userId),
    );

    await this.commandBus.execute(
      new LoginDeviceCommand(
        tokens.refreshToken,
        command.ip,
        command.userAgent,
      ),
    );

    return {
      refreshToken: tokens.refreshToken,
      accessToken: tokens.accessToken,
    };
  }
}
