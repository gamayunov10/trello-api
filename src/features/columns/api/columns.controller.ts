import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { ColumnInputModel } from '../models/input/column-input.model';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { ColumnsQueryRepository } from '../infrastructure/columns.query.repo';
import { ColumnViewOutputModel } from '../models/output/column.view.output.model';

import { CreateColumnCommand } from './application/use-cases/column-create.use.case';

@Controller('columns')
@ApiTags('Columns')
export class ColumnsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly columnsQueryRepository: ColumnsQueryRepository,
  ) {}

  @Post('column')
  @SwaggerOptions(
    'Create column',
    true,
    false,
    201,
    'Created',
    ColumnViewOutputModel,
    'If the inputModel has incorrect values',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(201)
  async createColumn(
    @Body() columnInputModel: ColumnInputModel,
    @UserIdFromGuard() userId: string,
  ): Promise<ColumnViewOutputModel | void> {
    const result = await this.commandBus.execute(
      new CreateColumnCommand(columnInputModel, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return await this.columnsQueryRepository.findColumnById(result.res);
  }
}
