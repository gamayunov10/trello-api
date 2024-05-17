import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IncomingMessage } from 'http';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { MeView } from '../models/output/me-view.model';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repo';
import { UserDevicesQueryRepository } from '../../users/infrastructure/devices/user.devices.query.repo';
import { DeviceAuthSessionGuard } from '../../../infrastructure/guards/devie-auth-session.guard';
import { JwtBearerGuard } from '../guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../decorators/user-id-from-guard.guard.decorator';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  confirmationCodeIsIncorrect,
  confirmCodeField,
  emailField,
  emailOrPasswordField,
  emailOrPasswordIncorrect,
  passwordNotSaved,
  userIdField,
  userNotFound,
  userNotFoundOrConfirmed,
} from '../../../base/constants/constants';
import { DeviceViewModel } from '../models/output/device-view.model';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { RefreshToken } from '../decorators/refresh-token.param.decorator';
import { AccessTokenView } from '../models/output/access-token-view.model';
import { GoogleOAuth2Guard } from '../../../infrastructure/guards/google-oauth2.guard';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { GitHubOAuth2Guard } from '../../../infrastructure/guards/github-oauth2.guard';
import { UserAuthInputModel } from '../models/input/user-auth.input.model';
import { UserConfirmationCodeInputModel } from '../models/input/user-confirmation-code.input.model';
import { EmailInputModel } from '../models/input/email-input.model';
import { RecaptchaV2Guard } from '../../../infrastructure/guards/recaptcha-v2.guard';
import { UserPasswdRecoveryInputModel } from '../models/input/user-passwd-recovery.input.model';
import { NewPasswordModel } from '../models/input/new-password.model';
import { UserLoginInputModel } from '../models/input/user-login.input.model';

import { CreateOAuthTokensCommand } from './application/use-cases/tokens/create-oauth-token.use-case';
import { LoginDeviceCommand } from './application/use-cases/devices/login-device.use-case';
import { CreateTokensCommand } from './application/use-cases/tokens/create-token.use-case';
import { UpdateTokensCommand } from './application/use-cases/tokens/update-tokens.usecase';
import { RegistrationCommand } from './application/use-cases/registration/registration.use-case';
import { RegistrationConfirmationCommand } from './application/use-cases/registration/registration-confirmation.use-case';
import { RegistrationEmailResendCommand } from './application/use-cases/registration/registration-email-resend.usecase';
import { PasswordRecoveryCommand } from './application/use-cases/password/password-recovery.use-case';
import { PasswordUpdateCommand } from './application/use-cases/password/password-update.usecase';
import { LoginCommand } from './application/use-cases/login.use.case';
import { LogoutDeviceCommand } from './application/use-cases/devices/logout-device.use-case';
import { TerminateOtherSessionsCommand } from './application/use-cases/devices/terminate-other-sessions.use-case';
import { TerminateSessionCommand } from './application/use-cases/devices/terminate-session.use-case';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly userDevicesQueryRepository: UserDevicesQueryRepository,
  ) {}

  @Get('me')
  @SwaggerOptions(
    'Get information about current user',
    true,
    false,
    200,
    'Success',
    MeView,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  async getProfile(@UserIdFromGuard() userId: string) {
    const user = await this.usersQueryRepository.findUserById(userId);

    if (!user) {
      return exceptionHandler(ResultCode.NotFound, userNotFound, userIdField);
    }

    return {
      email: user?.email,
      userId,
    };
  }

  @Get('devices')
  @SwaggerOptions(
    'Get all other devices sessions',
    false,
    false,
    200,
    'Success',
    DeviceViewModel,
    false,
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  async findActiveDevices(
    @RefreshToken() refreshToken: string,
  ): Promise<DeviceViewModel[]> {
    const decodedToken = this.jwtService.decode(refreshToken);

    const userId = decodedToken?.userId;

    return this.userDevicesQueryRepository.findActiveDevices(userId);
  }

  @Get('google/login')
  @SwaggerOptions(
    'Try login user to the system by Google (OAuth2)',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 3 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 7 days).',
    AccessTokenView,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  @UseGuards(GoogleOAuth2Guard)
  @HttpCode(200)
  async googleLogin() {
    return { msg: 'Google Auth' };
  }

  @Get('google/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleOAuth2Guard)
  async googleRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: IncomingMessage,
  ): Promise<void> {
    const user: Partial<User> = req.user;

    const result = await this.commandBus.execute(
      new CreateOAuthTokensCommand(user),
    );

    const userAgent = headers['user-agent'] || 'unknown';

    await this.commandBus.execute(
      new LoginDeviceCommand(result.accessToken, userAgent, 'oauth'),
    );

    (res as Response)
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .redirect(
        this.configService.get<string>('PUBLIC_FRONT_URL') +
          `/google-auth/?access-token=${result.accessToken}`,
      );
  }

  @Get('github/login')
  @SwaggerOptions(
    'Try login user to the system by Github (OAuth2)',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 3 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 7 days).',
    AccessTokenView,
    'If the provider has not provided all the necessary data',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @UseGuards(GitHubOAuth2Guard)
  @HttpCode(200)
  async githubLogin() {
    return { msg: 'GitHub Auth' };
  }

  @Get('github/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(GitHubOAuth2Guard)
  async githubRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: IncomingMessage,
  ): Promise<void> {
    const user: Partial<User> = req.user;

    const result = await this.commandBus.execute(
      new CreateOAuthTokensCommand(user),
    );

    const userAgent = headers['user-agent'] || 'unknown';

    await this.commandBus.execute(
      new LoginDeviceCommand(result.accessToken, userAgent, 'oauth'),
    );

    (res as Response)
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .redirect(
        this.configService.get<string>('PUBLIC_FRONT_URL') +
          `/github-auth/?access-token=${result.accessToken}`,
      );
  }

  @Post('refresh-token')
  @SwaggerOptions(
    'Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing) Device LastActiveDate should be overrode by issued Date of new refresh token',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 3 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 7 days).',
    AccessTokenView,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  async refreshTokens(
    @UserIdFromGuard() userId: string,
    @Ip() ip: string,
    @Headers() headers: string,
    @RefreshToken() refreshToken: string,
    @Res() res: Response,
  ): Promise<void> {
    const userAgent = headers['user-agent'] || 'unknown';

    const decodedToken: any = this.jwtService.decode(refreshToken);

    const tokens = await this.commandBus.execute(
      new CreateTokensCommand(userId, decodedToken.deviceId),
    );

    const newToken = this.jwtService.decode(tokens.refreshToken);

    await this.commandBus.execute(
      new UpdateTokensCommand(newToken, ip, userAgent),
    );

    (res as Response)
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: false,
      })
      .json({ accessToken: tokens.accessToken });
  }

  @Post('registration')
  @SwaggerOptions(
    'Registration in the system',
    false,
    false,
    204,
    'Input data is accepted. Email with confirmation code will be send to passed email address',
    false,
    'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async registerUser(
    @Body() userAuthInputModel: UserAuthInputModel,
  ): Promise<void> {
    return await this.commandBus.execute(
      new RegistrationCommand(userAuthInputModel),
    );
  }

  @Post('registration-confirmation')
  @SwaggerOptions(
    'Confirm registration',
    false,
    false,
    204,
    'Email was verified. Account was activated',
    false,
    'If the confirmation code is incorrect, expired or already been applied',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async confirmUser(
    @Body() userConfirmationCodeInputModel: UserConfirmationCodeInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(userConfirmationCodeInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        confirmationCodeIsIncorrect,
        confirmCodeField,
      );
    }

    return result;
  }

  @Post('registration-email-resending')
  @SwaggerOptions(
    'Resend confirmation registration Email if user exists',
    false,
    false,
    204,
    'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
    false,
    true,
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async resendEmail(@Body() emailInputModel: EmailInputModel) {
    const result = await this.commandBus.execute(
      new RegistrationEmailResendCommand(emailInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        userNotFoundOrConfirmed,
        emailField,
      );
    }

    return result;
  }

  @Post('password-recovery')
  @SwaggerOptions(
    'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
    false,
    false,
    204,
    'Success',
    false,
    true,
    ApiErrorMessages,
    false,
    'reCAPTCHA',
    `If User with this email doesn't exist`,
    false,
  )
  @UseGuards(RecaptchaV2Guard)
  @HttpCode(204)
  async passwordRecovery(
    @Body() userPasswdRecoveryInputModel: UserPasswdRecoveryInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new PasswordRecoveryCommand(userPasswdRecoveryInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post('new-password')
  @SwaggerOptions(
    'Confirm Password recovery',
    false,
    false,
    204,
    'If code is valid and new password is accepted',
    false,
    'If the inputModel has incorrect value or RecoveryCode is incorrect or expired',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: passwordNotSaved,
  })
  @HttpCode(204)
  async updatePassword(
    @Body() newPasswordModel: NewPasswordModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new PasswordUpdateCommand(newPasswordModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post('login')
  @SwaggerOptions(
    'Try login user to the system',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 3 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 7 days).',
    AccessTokenView,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    'If the password or login is wrong',
    false,
    false,
    false,
  )
  @HttpCode(200)
  async login(
    @Ip() ip: string,
    @Body() userLoginInputModel: UserLoginInputModel,
    @Headers() headers: IncomingMessage,
    @Res() res: Response,
  ): Promise<void> {
    const userAgent = headers['user-agent'] || 'unknown';

    const result = await this.commandBus.execute(
      new LoginCommand(userLoginInputModel, userAgent, ip),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.Unauthorized,
        emailOrPasswordIncorrect,
        emailOrPasswordField,
      );
    }

    (res as Response)
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: result.accessToken });
  }

  @Post('logout')
  @SwaggerOptions(
    'Logout of an authorized user',
    false,
    false,
    204,
    'No content',
    false,
    false,
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async logout(@RefreshToken() refreshToken: string): Promise<void> {
    await this.commandBus.execute(new LogoutDeviceCommand(refreshToken));
  }

  @Delete('devices')
  @SwaggerOptions(
    'Terminate all other (exclude current) devices sessions',
    false,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async deleteOldDevices(@RefreshToken() refreshToken: string) {
    const decodedToken = this.jwtService.decode(refreshToken);

    return this.commandBus.execute(
      new TerminateOtherSessionsCommand(
        decodedToken?.deviceId,
        decodedToken?.userId,
      ),
    );
  }

  @Delete('devices/:id')
  @SwaggerOptions(
    'Terminate specified device session',
    false,
    false,
    204,
    'No Content',
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    'If try to delete the deviceId of other user',
    true,
    false,
  )
  @UseGuards(JwtRefreshGuard)
  @HttpCode(204)
  async terminateSession(
    @Param('id') deviceId: string,
    @UserIdFromGuard() userId: string,
  ) {
    const result = await this.commandBus.execute(
      new TerminateSessionCommand(deviceId, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
