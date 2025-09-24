import { Injectable } from '@nestjs/common';
import { eq, desc, and, sql } from 'drizzle-orm';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { wsLogs } from '../../drizzle/schema';

export interface CreateWsLogDto {
  projectId: number;
  message?: string;
  timestamp: Date | string | number;
  log: any;
}

export interface WsLogQueryDto {
  projectId: number;
  page?: number;
  limit?: number;
}

export interface PaginatedWsLogs {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class WsLogsService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(createWsLogDto: CreateWsLogDto) {
    try {
      // Convert timestamp to PostgreSQL format
      let timestampValue: string;

      if (typeof createWsLogDto.timestamp === 'number') {
        // Unix timestamp in milliseconds
        timestampValue = new Date(createWsLogDto.timestamp).toISOString();
      } else if (typeof createWsLogDto.timestamp === 'string') {
        timestampValue = new Date(createWsLogDto.timestamp).toISOString();
      } else if (createWsLogDto.timestamp instanceof Date) {
        timestampValue = createWsLogDto.timestamp.toISOString();
      } else {
        timestampValue = new Date().toISOString();
      }

      const result = await this.drizzle.db.insert(wsLogs).values({
        projectId: createWsLogDto.projectId,
        message: createWsLogDto.message || null,
        timestamp: timestampValue,
        log: createWsLogDto.log,
      }).returning();

      return result[0];
    } catch (error) {
      console.error('Error creating WebSocket log:', error);
      throw error;
    }
  }

  async findAllPaginated(query: WsLogQueryDto): Promise<PaginatedWsLogs> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 8; // Default to 8 items per page
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const countResult = await this.drizzle.db
        .select({ count: sql<number>`count(*)::int` })
        .from(wsLogs)
        .where(eq(wsLogs.projectId, query.projectId));

      const totalItems = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalItems / limit);

      // Fetch paginated logs
      const logs = await this.drizzle.db
        .select()
        .from(wsLogs)
        .where(eq(wsLogs.projectId, query.projectId))
        .orderBy(desc(wsLogs.timestamp))
        .limit(limit)
        .offset(offset);

      return {
        data: logs,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated WebSocket logs:', error);
      throw error;
    }
  }

  async findLatest(projectId: number, limit: number = 8) {
    try {
      const logs = await this.drizzle.db
        .select()
        .from(wsLogs)
        .where(eq(wsLogs.projectId, projectId))
        .orderBy(desc(wsLogs.timestamp))
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('Error fetching latest WebSocket logs:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const log = await this.drizzle.db
        .select()
        .from(wsLogs)
        .where(eq(wsLogs.id, id))
        .limit(1);

      return log[0] || null;
    } catch (error) {
      console.error('Error fetching WebSocket log:', error);
      throw error;
    }
  }

  async deleteByProject(projectId: number) {
    try {
      const result = await this.drizzle.db
        .delete(wsLogs)
        .where(eq(wsLogs.projectId, projectId))
        .returning();

      return { deletedCount: result.length };
    } catch (error) {
      console.error('Error deleting WebSocket logs:', error);
      throw error;
    }
  }

  async deleteOldLogs(projectId: number, daysToKeep: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.drizzle.db
        .delete(wsLogs)
        .where(
          and(
            eq(wsLogs.projectId, projectId),
            sql`${wsLogs.timestamp} < ${cutoffDate.toISOString()}`
          )
        )
        .returning();

      return { deletedCount: result.length };
    } catch (error) {
      console.error('Error deleting old WebSocket logs:', error);
      throw error;
    }
  }
}