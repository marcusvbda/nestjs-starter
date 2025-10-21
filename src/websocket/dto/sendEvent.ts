import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SendEventDto {
  @IsString()
  @ApiProperty({ example: 'xyz' })
  userId: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'lorem ipsum' })
  message: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'event-name' })
  event: string;
}
