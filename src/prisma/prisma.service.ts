import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { INestApplication } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { envs } from '../config/envs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger('Prisma Service')

  constructor() {
    super({
      // Prisma v7+ requires either an adapter or accelerateUrl.
      adapter: new PrismaMariaDb(envs.DATABASE_URL),
      log: ['query', 'info', 'warn', 'error'],
      // Add transaction timeout settings
      transactionOptions: {
        maxWait: 20000, // Maximum time to wait for a transaction to start (20 seconds)
        timeout: 30000, // Maximum time for a transaction to complete (30 seconds)
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma connected to the database');
    
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
