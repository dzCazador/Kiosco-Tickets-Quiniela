import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Query, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { extname } from 'path';

import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads', // Asegúrate de que esta carpeta exista en la raíz
      filename: (req, file, cb) => {
        // Generamos un nombre único: timestamp-random.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() createTicketDto: CreateTicketDto, 
    @UploadedFile() file: Express.Multer.File
  ) {
    // Si hay archivo, guardamos la ruta relativa para la DB
    const imageUrl = file ? `/uploads/${file.filename}` : null;
    return this.ticketsService.create(createTicketDto, imageUrl);
  }

  // GET /tickets?from=2024-01-01&to=2024-01-31
  @Get()
  findAll(
    @Query('from') from?: string, 
    @Query('to') to?: string
  ) {
    return this.ticketsService.findAll(from, to);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(+id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(+id);
  }
}
