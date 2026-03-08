import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(createTicketDto: CreateTicketDto, imageUrl?: string) {
    const bruto = parseFloat(createTicketDto.gross_amount);
    const premios = parseFloat(createTicketDto.prizes_amount);
    const telequino = parseFloat(createTicketDto.telequino_amount);
    const ticketDate = new Date(createTicketDto.date);
    const machineId = parseInt(createTicketDto.machineId);

  // 1. VALIDACIÓN: Evitar duplicados (Misma máquina, misma fecha)
      const existingTicket = await this.prisma.ticket.findFirst({
        where: {
          date: ticketDate,
          machineId: machineId,
        },
      });

      if (existingTicket) {
        throw new BadRequestException(
          `Ya existe un ticket cargado para esta máquina en la fecha ${createTicketDto.date}`
        );
      }    

    // 1. Cálculo sugerido: Bruto - Premios + (Telequino / 2)
    const sugerido = bruto - premios + (telequino / 2);

    // 2. Si el usuario envió un neto manual lo usamos, si no, el sugerido
    const netoFinal = createTicketDto.net_amount 
      ? parseFloat(createTicketDto.net_amount) 
      : sugerido;

    return this.prisma.ticket.create({
      data: {
        date: new Date(createTicketDto.date),
        gross_amount: bruto,
        prizes_amount: premios,
        telequino_amount: telequino,
        net_amount: netoFinal,
        image_url: imageUrl,
        machineId: parseInt(createTicketDto.machineId),
      },
    });
  }

  // Reporte con filtro de fechas (Desde - Hasta)
  async findAll(from?: string, to?: string) {
    return this.prisma.ticket.findMany({
      where: {
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: {
        machine: true, // Incluye los datos de la máquina
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { machine: true },
    });
    if (!ticket) throw new NotFoundException(`Ticket #${id} no encontrado`);
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    // Si se actualizan montos, podrías recalcular el neto aquí también si fuera necesario
    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...updateTicketDto,
        // Convertimos tipos si vienen en el DTO
        gross_amount: updateTicketDto.gross_amount ? parseFloat(updateTicketDto.gross_amount) : undefined,
        prizes_amount: updateTicketDto.prizes_amount ? parseFloat(updateTicketDto.prizes_amount) : undefined,
        telequino_amount: updateTicketDto.telequino_amount ? parseFloat(updateTicketDto.telequino_amount) : undefined,
        net_amount: updateTicketDto.net_amount ? parseFloat(updateTicketDto.net_amount) : undefined,
        machineId: updateTicketDto.machineId ? parseInt(updateTicketDto.machineId) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }
}