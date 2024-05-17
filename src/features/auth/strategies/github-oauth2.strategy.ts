import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';

import { AuthService } from '../api/application/auth.service';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  emailField,
  githubEmailNotAvailable,
} from '../../../base/constants/constants';
import { OAuthConfig } from '../config/oauth.config';
import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class GithubOAuth2Strategy extends PassportStrategy(
  Strategy,
  StrategyType.GITHUB,
) {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService,
    protected readonly oauthConfig: OAuthConfig,
  ) {
    super({
      clientID: oauthConfig.githubClientIdValue,
      clientSecret: oauthConfig.githubClientSecretValue,
      callbackURL: oauthConfig.githubCallBackURLValue,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    if (!Array.isArray(profile?.emails)) {
      return exceptionHandler(
        ResultCode.BadRequest,
        githubEmailNotAvailable,
        emailField,
      );
    }

    const data = {
      userProviderId: profile.id,
      displayName: profile.displayName,
      email: profile?.emails[0]?.value,
      provider: profile.provider,
    };

    const user = await this.authService.validateUser(data);

    return user || null;
  }
}
