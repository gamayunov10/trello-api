import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}
}
