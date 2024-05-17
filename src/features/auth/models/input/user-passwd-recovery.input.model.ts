import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserPasswdRecoveryInputModel {
  @ApiProperty({ type: String, format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  reCaptcha: string;
}
