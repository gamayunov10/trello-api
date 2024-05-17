import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { StrategyType } from '../../../base/enums/strategy-type.enum';
import { JwtConfig } from '../config/jwt.config';

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BEARER,
) {
  constructor(protected readonly jwtConfig: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
    });
  }

  async validate(payload) {
    return {
      id: payload.userId,
    };
  }
}
