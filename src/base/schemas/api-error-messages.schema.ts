import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorMessage {
  @ApiProperty({
    description: 'Message with error explanation for certain field',
    example: 'Sample error message',
    nullable: true,
  })
  message: string;

  @ApiProperty({
    description: 'What field/property of input model has error',
    example: 'fieldName',
    nullable: true,
  })
  field: string;
}

export class ApiErrorMessages {
  @ApiProperty({
    description: 'Array of error messages',
    type: [ApiErrorMessage],
    nullable: true,
  })
  errorsMessages: ApiErrorMessage[];
}
