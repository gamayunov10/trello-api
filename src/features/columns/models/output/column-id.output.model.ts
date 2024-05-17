import { ApiProperty } from '@nestjs/swagger';

export class ColumnIdOutputModel {
  @ApiProperty({
    type: String,
  })
  columnId: string;
}
