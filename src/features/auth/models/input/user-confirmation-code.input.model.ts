import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmptyString } from '../../../../infrastructure/decorators/is-not-empty-string.decorator';

export class UserConfirmationCodeInputModel {
  @ApiProperty({ type: String })
  @IsNotEmptyString()
  code: string;
}
