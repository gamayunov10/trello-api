import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { exceptionHandler } from '../exception-filters/exception-handler';
import { ResultCode } from '../../base/enums/result-code.enum';
import { UserDevicesQueryRepository } from '../../features/users/infrastructure/devices/user.devices.query.repo';
import { UsersQueryRepository } from '../../features/users/infrastructure/users.query.repo';

@Injectable()
export class DeviceAuthSessionGuard implements CanActivate {
  constructor(
    private readonly userDevicesQueryRepo: UserDevicesQueryRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = req.headers?.authorization?.split(' ')[1];

    const decodedToken = this.jwtService.decode(token);

    const user = await this.usersQueryRepo.findUserById(decodedToken.userId);

    if (!user) {
      exceptionHandler(ResultCode.Unauthorized, 'Unauthorized', 'None');
      return false;
    }

    const device = await this.userDevicesQueryRepo.findUserByDeviceId(
      decodedToken.userId,
      decodedToken.deviceId,
    );

    if (!device) {
      exceptionHandler(ResultCode.Unauthorized, 'Unauthorized', 'None');
      return false;
    }

    return true;
  }
}
