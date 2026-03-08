import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketDto {
  
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString()
  date: string;

  @IsNotEmpty({ message: 'El importe bruto es obligatorio' })
  @IsNumberString({}, { message: 'El importe bruto debe ser un número válido' })
  gross_amount: string;

  @IsNotEmpty({ message: 'El importe de premios es obligatorio' })
  @IsNumberString({}, { message: 'El importe de premios debe ser un número válido' })
  prizes_amount: string;

  @IsNotEmpty({ message: 'El importe de Telequino es obligatorio' })
  @IsNumberString({}, { message: 'El importe de Telequino debe ser un número válido' })
  telequino_amount: string;

  @IsOptional() // Es opcional porque el Service lo calcula si no viene
  @IsNumberString({}, { message: 'El importe neto debe ser un número válido' })
  net_amount?: string;

  @IsNotEmpty({ message: 'Debes seleccionar una máquina' })
  @IsString()
  machineId: string;
}