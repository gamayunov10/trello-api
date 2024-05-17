import { ApiProperty } from '@nestjs/swagger';

export class DeviceViewModel {
  @ApiProperty({ type: String })
  deviceId: string;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: Date })
  lastActiveDate: Date;
}
