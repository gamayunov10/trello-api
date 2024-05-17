import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserConfirmationCodeInputModel } from '../../../../models/input/user-confirmation-code.input.model';
import { UsersRepository } from '../../../../../users/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query.repo';

export class RegistrationConfirmationCommand {
  constructor(
    public userConfirmationCodeInputModel: UserConfirmationCodeInputModel,
  ) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user =
      await this.usersQueryRepository.findUserByEmailConfirmationCode(
        command.userConfirmationCodeInputModel.code,
      );

    if (
      !user ||
      user?.isConfirmed ||
      user?.confirmationCode.expirationDate < new Date()
    ) {
      return false;
    }

    return this.usersRepository.confirmUser(user.id);
  }
}
