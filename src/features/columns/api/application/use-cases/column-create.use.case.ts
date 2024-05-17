import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ColumnInputModel } from '../../../models/input/column-input.model';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  columnNotSaved,
  noneField,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { ColumnsRepository } from '../../../infrastructure/columns.repo';

export class CreateColumnCommand {
  constructor(
    public columnInputModel: ColumnInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(CreateColumnCommand)
export class CreateColumnUseCase
  implements ICommandHandler<CreateColumnCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly columnsRepository: ColumnsRepository,
  ) {}

  async execute(command: CreateColumnCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const column = await this.columnsRepository.createColumn(
      command.columnInputModel,
      command.userId,
    );

    if (!column) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: columnNotSaved,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      res: column,
    };
  }
}
