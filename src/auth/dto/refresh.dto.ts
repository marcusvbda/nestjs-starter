import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @ApiProperty({ example: 'valid-refresh-token' })
  refreshToken: string;
}
