import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { NewPasswordModel } from '../../../../models/input/new-password.model';
import { exceptionHandler } from '../../../../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  confirmCodeField,
  passwordField,
  passwordNotSaved,
  recoveryCodeIsIncorrect,
} from '../../../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { UsersRepository } from '../../../../../users/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query.repo';
import { AuthService } from '../../auth.service';

export class PasswordUpdateCommand {
  constructor(public newPasswordModel: NewPasswordModel) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    command: PasswordUpdateCommand,
  ): Promise<ExceptionResultType<boolean> | void> {
    const user = await this.usersQueryRepository.findPasswordRecoveryRecord(
      command.newPasswordModel.recoveryCode,
    );

    if (!user || user?.expirationDate < new Date()) {
      return exceptionHandler(
        ResultCode.BadRequest,
        recoveryCodeIsIncorrect,
        confirmCodeField,
      );
    }

    const hash = await this.authService.hashPassword(
      command.newPasswordModel.newPassword,
    );

    const updateResult = await this.usersRepository.updatePassword(
      user.userId,
      hash.toString(),
    );

    if (!updateResult) {
      return exceptionHandler(
        ResultCode.InternalServerError,
        passwordNotSaved,
        passwordField,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
