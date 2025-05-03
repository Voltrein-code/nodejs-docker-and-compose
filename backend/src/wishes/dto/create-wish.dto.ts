import { IsNumber, IsPositive, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsUrl()
  image: string;

  @IsUrl()
  link: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
