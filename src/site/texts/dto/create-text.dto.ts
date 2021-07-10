import { IsNotEmpty } from 'class-validator';

export class CreateTextDto {
  @IsNotEmpty()
  section: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  text: string;
}
