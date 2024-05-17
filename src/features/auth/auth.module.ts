import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from '../users/infrastructure/users.repo';
import { UserDevicesRepository } from '../users/infrastructure/devices/user.devices.repo';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { UserDevicesQueryRepository } from '../users/infrastructure/devices/user.devices.query.repo';
import { IsEmailAlreadyExistConstraint } from '../../infrastructure/decorators/unique-email.decorator';

import { AuthService } from './api/application/auth.service';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './api/application/use-cases/registration/registration.use-case';
import { RegistrationConfirmationUseCase } from './api/application/use-cases/registration/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from './api/application/use-cases/password/password-recovery.use-case';
import { LoginUseCase } from './api/application/use-cases/login.use.case';
import { CreateTokensUseCase } from './api/application/use-cases/tokens/create-token.use-case';
import { LoginDeviceUseCase } from './api/application/use-cases/devices/login-device.use-case';
import { GoogleOAuth2Strategy } from './strategies/google-oauth2.strategy';
import { CreateOAuthTokensUseCase } from './api/application/use-cases/tokens/create-oauth-token.use-case';
import { SessionSerializer } from './utils/session.serializer';
import { GithubOAuth2Strategy } from './strategies/github-oauth2.strategy';
import { LogoutDeviceUseCase } from './api/application/use-cases/devices/logout-device.use-case';
import { JwtBearerStrategy } from './strategies/jwt-bearer.strategy';
import { UpdateTokensUseCase } from './api/application/use-cases/tokens/update-tokens.usecase';
import { ValidateRefreshTokenUseCase } from './api/application/use-cases/validations/validate-refresh-token.usecase';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { RegistrationEmailResendUseCase } from './api/application/use-cases/registration/registration-email-resend.usecase';
import { PasswordUpdateUseCase } from './api/application/use-cases/password/password-update.usecase';
import { JwtConfig } from './config/jwt.config';
import { OAuthConfig } from './config/oauth.config';
import { TerminateOtherSessionsUseCase } from './api/application/use-cases/devices/terminate-other-sessions.use-case';
import { TerminateSessionUseCase } from './api/application/use-cases/devices/terminate-session.use-case';

const services = [AuthService, PrismaClient, JwtService];
const useCases = [
  RegistrationUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  LoginUseCase,
  CreateTokensUseCase,
  LoginDeviceUseCase,
  CreateOAuthTokensUseCase,
  LogoutDeviceUseCase,
  UpdateTokensUseCase,
  ValidateRefreshTokenUseCase,
  RegistrationEmailResendUseCase,
  PasswordUpdateUseCase,
  TerminateOtherSessionsUseCase,
  TerminateSessionUseCase,
];
const repositories = [UsersRepository, UserDevicesRepository];
const queryRepositories = [UsersQueryRepository, UserDevicesQueryRepository];
const constraints = [IsEmailAlreadyExistConstraint];
const strategy = [
  GoogleOAuth2Strategy,
  GithubOAuth2Strategy,
  JwtBearerStrategy,
  JwtRefreshTokenStrategy,
];
const config = [JwtConfig, OAuthConfig];

@Module({
  imports: [CqrsModule, PassportModule.register({ session: true })],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...strategy,
    ...queryRepositories,
    ...constraints,
    ...config,
    SessionSerializer,
    ConfigService,
    {
      provide: 'AUTH_SERVICE',
      useClass: AuthService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
