import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

export class CreateTokensCommand {
  constructor(
    public userId: string,
    public deviceId = randomUUID(),
  ) {}
}

@CommandHandler(CreateTokensCommand)
export class CreateTokensUseCase
  implements ICommandHandler<CreateTokensCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateTokensCommand) {
    const tokenPayload = {
      userId: command.userId,
      deviceId: command.deviceId,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXP'),
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXP'),
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
