import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class JwtBearerGuard extends AuthGuard(StrategyType.BEARER) {}
