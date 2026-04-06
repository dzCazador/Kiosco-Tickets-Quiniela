import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  Query, UseInterceptors, UploadedFile, Res 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import { extname } from 'path';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import * as archiver from 'archiver';

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
        // Generamos un nombre único: timestamp-random.jpg (siempre JPEG)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}.jpg`);
      },
    }),
  }))
  async create(
    @Body() createTicketDto: CreateTicketDto, 
    @UploadedFile() file: Express.Multer.File
  ) {
    // Si hay archivo, guardamos la ruta relativa para la DB
    const imageUrl = file ? `/uploads/${file.filename}` : null;

    // Procesar la imagen para reducir calidad si existe
    if (file) {
      const filePath = path.join('./uploads', file.filename);
      try {
        // Convertir a JPEG con calidad reducida
        await sharp(filePath)
          .jpeg({ quality: 70 })
          .toFile(filePath + '_temp');
        // Reemplazar el archivo original con el comprimido
        fs.renameSync(filePath + '_temp', filePath);
      } catch (error) {
        console.error('Error procesando imagen:', error);
        // Si falla, continuar sin comprimir
      }
    }

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

  // GET /tickets/package?from=2024-01-01&to=2024-01-31
  @Get('package')
  async getPackage(
    @Res() res: any,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const tickets = await this.ticketsService.findAll(from, to);

    // Crear Excel
    const workbook = XLSX.utils.book_new();

    // Crear filas con la planilla solicitada
    const rows: any[][] = [
      ['Fecha', 'Máquina', 'Recaudación', 'Premios', 'Telebingo', 'Comisión', 'Descuentos', 'Total']
    ];

    tickets.forEach((ticket, index) => {
      const rowNumber = index + 2;
      rows.push([
        ticket.date.toISOString().split('T')[0],
        ticket.machineId,
        ticket.gross_amount,
        ticket.prizes_amount,
        ticket.telequino_amount,
        { f: `C${rowNumber}*0.1` },
        { f: `E${rowNumber}/2` },
        { f: `C${rowNumber}-D${rowNumber}-F${rowNumber}-G${rowNumber}` }
      ]);
    });

    // Agregar fila de totales al final para mantener todo en la misma hoja
    rows.push([]);
    rows.push([
      '',
      'Totales',
      { f: `SUM(C2:C${tickets.length + 1})` },
      { f: `SUM(D2:D${tickets.length + 1})` },
      { f: `SUM(E2:E${tickets.length + 1})` },
      { f: `SUM(F2:F${tickets.length + 1})` },
      { f: `SUM(G2:G${tickets.length + 1})` },
      { f: `SUM(H2:H${tickets.length + 1})` }
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let row = 2; row <= range.e.r + 1; ++row) {
      for (const col of ['C', 'D', 'E', 'F', 'G', 'H']) {
        const address = `${col}${row}`;
        const cell = worksheet[address];
        if (cell && (typeof cell.v === 'number' || cell.f)) {
          cell.z = '#,##0.00';
        }
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tickets');

    // Crear ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=tickets_${from || 'all'}_${to || 'all'}.zip`);

    archive.pipe(res);

    // Agregar Excel al ZIP
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    archive.append(excelBuffer, { name: 'tickets.xlsx' });

    // Agregar imágenes
    for (const ticket of tickets) {
      if (ticket.image_url) {
        const imagePath = path.join(process.cwd(), ticket.image_url);
        if (fs.existsSync(imagePath)) {
          const dateStr = ticket.date.toISOString().split('T')[0];
          const newName = `Maquina${ticket.machineId}_${dateStr}.jpg`;
          archive.file(imagePath, { name: `images/${newName}` });
        }
      }
    }

    await archive.finalize();
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
