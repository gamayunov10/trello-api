import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuthConfig {
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;
  private readonly githubCallBackURL: string;
  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly googleCallBackURL: string;

  constructor(private readonly configService: ConfigService) {
    this.githubClientId = this.getSecret('GITHUB_CLIENT_ID');
    this.githubClientSecret = this.getSecret('GITHUB_CLIENT_SECRET');
    this.githubCallBackURL = this.getSecret('GITHUB_CALL_BACK_URL');
    this.googleClientId = this.getSecret('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.getSecret('GOOGLE_CLIENT_SECRET');
    this.googleCallBackURL = this.getSecret('GOOGLE_CALL_BACK_URL');
  }

  private getSecret(key: string): string {
    const secret = this.configService.get<string>(key);

    if (!secret) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return secret;
  }

  get githubClientIdValue() {
    return this.githubClientId;
  }

  get githubClientSecretValue() {
    return this.githubClientSecret;
  }

  get githubCallBackURLValue() {
    return this.githubCallBackURL;
  }

  get googleClientIdValue() {
    return this.googleClientId;
  }

  get googleClientSecretValue() {
    return this.googleClientSecret;
  }

  get googleCallBackURLValue() {
    return this.googleCallBackURL;
  }
}
