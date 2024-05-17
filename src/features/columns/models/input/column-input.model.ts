import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength, MinLength } from 'class-validator';

import { IsNotEmptyString } from '../../../../infrastructure/decorators/is-not-empty-string.decorator';
import {
  maxChar20,
  maxChar500,
  minChar6,
} from '../../../../base/constants/constants';

export class ColumnInputModel {
  @ApiProperty({ type: String, minLength: 6, maxLength: 20 })
  @MaxLength(20, { message: maxChar20 })
  @MinLength(6, { message: minChar6 })
  @IsNotEmptyString()
  title: string;

  @ApiProperty({
    type: String,
    minLength: 0,
    maxLength: 500,
    required: false,
  })
  @MaxLength(500, { message: maxChar500 })
  @IsOptional()
  description?: string;
}
