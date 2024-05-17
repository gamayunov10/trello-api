import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

export class CreateOAuthTokensCommand {
  constructor(public user: Partial<User>) {}
}

@CommandHandler(CreateOAuthTokensCommand)
export class CreateOAuthTokensUseCase
  implements ICommandHandler<CreateOAuthTokensCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateOAuthTokensCommand) {
    const payload = {
      deviceId: randomUUID(),
      userId: command.user.id,
      email: command.user.email,
      issueAt: new Date(Date.now()),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXP'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXP'),
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
