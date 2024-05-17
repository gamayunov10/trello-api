import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { StrategyType } from '../../../base/enums/strategy-type.enum';
import { JwtConfig } from '../config/jwt.config';
import { refreshTokenExtractor } from '../utils/refresh-token-extractor';
import { ValidateRefreshTokenCommand } from '../api/application/use-cases/validations/validate-refresh-token.usecase';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH,
) {
  constructor(
    private commandBus: CommandBus,
    protected readonly jwtConfig: JwtConfig,
  ) {
    super({
      jwtFromRequest: refreshTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtConfig.refreshSecret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload) {
    const result = await this.commandBus.execute(
      new ValidateRefreshTokenCommand(payload),
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.userId,
    };
  }
}
