import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { AuthService } from '../api/application/auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService,
  ) {
    super();
  }

  serializeUser(user: any, done: any) {
    done(null, user);
  }

  async deserializeUser(payload: any, done: any) {
    const user = await this.authService.findUserById(payload.id);

    return user ? done(null, user) : done(null, null);
  }
}
