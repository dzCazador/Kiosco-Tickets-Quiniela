import { IsNotEmpty, IsNumberString, IsString, IsDateString } from 'class-validator';

export class CreateDuoTicketDto {
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString()
  date: string;

  @IsNotEmpty({ message: 'El primer bruto es obligatorio' })
  @IsNumberString({}, { message: 'El primer bruto debe ser un número válido' })
  gross_amount_one: string;

  @IsNotEmpty({ message: 'El segundo bruto es obligatorio' })
  @IsNumberString({}, { message: 'El segundo bruto debe ser un número válido' })
  gross_amount_two: string;

  @IsNotEmpty({ message: 'El primer premio es obligatorio' })
  @IsNumberString({}, { message: 'El primer premio debe ser un número válido' })
  prizes_amount_one: string;

  @IsNotEmpty({ message: 'El segundo premio es obligatorio' })
  @IsNumberString({}, { message: 'El segundo premio debe ser un número válido' })
  prizes_amount_two: string;

  @IsNotEmpty({ message: 'El primer Telequino es obligatorio' })
  @IsNumberString({}, { message: 'El primer Telequino debe ser un número válido' })
  telequino_amount_one: string;

  @IsNotEmpty({ message: 'El segundo Telequino es obligatorio' })
  @IsNumberString({}, { message: 'El segundo Telequino debe ser un número válido' })
  telequino_amount_two: string;

  @IsNotEmpty({ message: 'El primer neto es obligatorio' })
  @IsNumberString({}, { message: 'El primer neto debe ser un número válido' })
  net_amount_one: string;

  @IsNotEmpty({ message: 'El segundo neto es obligatorio' })
  @IsNumberString({}, { message: 'El segundo neto debe ser un número válido' })
  net_amount_two: string;
}
