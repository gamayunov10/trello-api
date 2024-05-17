import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SendRegistrationMailUseCase } from './application/use-cases/send-registration-mail.use-case';
import { SendPasswordRecoveryUseCase } from './application/use-cases/send-pass-recovery-mail.use-case';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          port: 465,
          host: 'smtp.gmail.com',
          auth: {
            user: configService.get<string>('EMAIL'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
          secure: true,
        },
        defaults: {
          from: `"Trello" <${configService.get<string>('EMAIL')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SendRegistrationMailUseCase, SendPasswordRecoveryUseCase],
})
export class MailModule {}
