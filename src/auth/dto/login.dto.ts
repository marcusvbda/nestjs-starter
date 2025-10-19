import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'user@test.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ example: '123456' })
  password: string;
}
