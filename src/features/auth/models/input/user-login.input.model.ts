import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { emailIsIncorrect } from '../../../../base/constants/constants';

export class UserLoginInputModel {
  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
  })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: emailIsIncorrect,
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
