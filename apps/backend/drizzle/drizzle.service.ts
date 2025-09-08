// src/database/drizzle.service.ts
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  private pool: Pool;
  db: any;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    this.pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 1,
      ssl: { rejectUnauthorized: false }
    });
    
    this.db = drizzle(this.pool, { schema });
    this.logger.log('Database service initialized');
  }

  // Remove onModuleInit - let connections happen lazily when queries are made
  
  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Database connection closed');
  }
}