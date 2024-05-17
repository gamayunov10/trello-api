import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../base/enums/node-env.enum';

export class SendPasswordRecoveryMailCommand {
  constructor(
    public email: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SendPasswordRecoveryMailCommand)
export class SendPasswordRecoveryUseCase
  implements ICommandHandler<SendPasswordRecoveryMailCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendPasswordRecoveryMailCommand) {
    if (this.configService.get('ENV') !== NodeEnv.TESTING) {
      const url = `${this.configService.get('PUBLIC_FRONT_URL')}/auth/create-new-password?recoveryCode=${command.recoveryCode}`;

      await this.mailerService.sendMail({
        to: command.email,
        subject: 'Password recovery',
        html: `
              <p>To recover your password please follow the link below, or simply ignore it if you find it suspicious:
                <a href="${url}">Click here to reset your password</a>
              </p>
            `,
        context: {
          url,
        },
      });
    }
  }
}
