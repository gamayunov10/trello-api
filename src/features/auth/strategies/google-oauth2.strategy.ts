import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';

import { AuthService } from '../api/application/auth.service';
import { OAuthConfig } from '../config/oauth.config';
import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class GoogleOAuth2Strategy extends PassportStrategy(
  Strategy,
  StrategyType.GOOGLE,
) {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService,
    protected readonly oauthConfig: OAuthConfig,
  ) {
    super({
      clientID: oauthConfig.googleClientIdValue,
      clientSecret: oauthConfig.googleClientSecretValue,
      callbackURL: oauthConfig.googleCallBackURLValue,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const data = {
      userProviderId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      provider: profile.provider,
    };

    const user = await this.authService.validateUser(data);

    return user || null;
  }
}
