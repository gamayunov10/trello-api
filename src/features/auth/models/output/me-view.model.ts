import { ApiProperty } from '@nestjs/swagger';

export class MeView {
  @ApiProperty({ type: String, format: 'email' })
  email: string;

  @ApiProperty({ type: String })
  userId: string;
}
