import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfig {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = this.getSecret(
      'ACCESS_TOKEN_SECRET',
      'default_access_secret',
    );
    this.refreshTokenSecret = this.getSecret(
      'REFRESH_TOKEN_SECRET',
      'default_refresh_secret',
    );
  }

  private getSecret(key: string, defaultValue: string): string {
    const secret = this.configService.get<string>(key, defaultValue);

    if (!secret) {
      if (this.configService.get<string>('ENV') === 'TESTING') {
        return defaultValue;
      }
      throw new Error(`Missing environment variable: ${key}`);
    }

    return secret;
  }

  get accessSecret() {
    return this.accessTokenSecret;
  }

  get refreshSecret() {
    return this.refreshTokenSecret;
  }
}
