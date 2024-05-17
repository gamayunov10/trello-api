import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailInputModel {
  @ApiProperty({ type: String, format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
