import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

import {
  emailIsIncorrect,
  emailNotUnique,
  maxChar20,
  minChar6,
  passwordIsIncorrect,
} from '../../../../base/constants/constants';
import { IsEmailAlreadyExist } from '../../../../infrastructure/decorators/unique-email.decorator';

export class UserAuthInputModel {
  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 20,
    pattern:
      '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\\"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~])',
  })
  @MinLength(6, { message: minChar6 })
  @MaxLength(20, { message: maxChar20 })
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/,
    {
      message: passwordIsIncorrect,
    },
  )
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, format: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: emailIsIncorrect,
  })
  @IsEmailAlreadyExist({ message: emailNotUnique })
  @IsNotEmpty()
  email: string;
}
