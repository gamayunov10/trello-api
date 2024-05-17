import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserAuthInputModel } from '../../../../models/input/user-auth.input.model';
import { NodeEnv } from '../../../../../../base/enums/node-env.enum';
import { UsersRepository } from '../../../../../users/infrastructure/users.repo';
import { AuthService } from '../../auth.service';
import { SendRegistrationMailCommand } from '../../../../../mail/application/use-cases/send-registration-mail.use-case';

export class RegistrationCommand {
  constructor(public userAuthInputModel: UserAuthInputModel) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  private readonly logger = new Logger(RegistrationUseCase.name);

  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async execute(command: RegistrationCommand): Promise<string | null> {
    const hash = await this.authService.hashPassword(
      command.userAuthInputModel.password,
    );

    const code = randomUUID();

    const userId = await this.usersRepository.registerUser(
      command.userAuthInputModel,
      hash.toString(),
      code,
    );

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(command.userAuthInputModel.email, code),
      );
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      await this.usersRepository.deleteUser(userId);
      return null;
    }

    return userId;
  }
}
