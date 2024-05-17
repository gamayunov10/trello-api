import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

import { IsNotEmptyString } from '../../../../infrastructure/decorators/is-not-empty-string.decorator';
import { maxChar20, minChar6 } from '../../../../base/constants/constants';

export class NewPasswordModel {
  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @MinLength(6, { message: minChar6 })
  @MaxLength(20, { message: maxChar20 })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ type: String })
  @IsNotEmptyString()
  recoveryCode: string;
}
