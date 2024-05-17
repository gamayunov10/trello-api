import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ReCaptchaResponse } from '../../base/types/re-captcha.response.type';

@Injectable()
export class RecaptchaV2Guard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const { body } = context.switchToHttp().getRequest();

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body: `secret=${this.configService.get('RECAPTCHA_SECRET_KEY')}&response=${body.reCaptcha}`,
      },
    );
    const data: ReCaptchaResponse = await response.json();

    if (!data.success) {
      throw new ForbiddenException();
    }

    return true;
  }
}
