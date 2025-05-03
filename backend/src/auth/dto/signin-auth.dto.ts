import { IsString } from 'class-validator';

export class SigninAuthDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
