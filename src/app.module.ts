import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PrismaModule } from './prisma/prisma.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [PrismaModule, 
            TicketsModule,
            ServeStaticModule.forRoot({
                  // process.cwd() apunta a: D:\Programacion\Nest\Kiosco-Tickets-Quiniela
                  rootPath: join(process.cwd(), 'client'), 
                  exclude: ['/api/(.*)'],
                }),
  ],
})
export class AppModule {}
