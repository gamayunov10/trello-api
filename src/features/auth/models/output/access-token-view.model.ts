import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenView {
  @ApiProperty({ type: String })
  accessToken: string;
}
