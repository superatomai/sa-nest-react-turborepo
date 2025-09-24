import { User } from '@clerk/backend';
import { BadRequestException, Injectable, ConflictException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DrizzleService } from 'drizzle/drizzle.service';
import { docs, projects } from 'drizzle/schema';

interface DocsData {
  id?: number;
  projectId?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
  apiDocs?: any;
}

@Injectable()
export class DocsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  // Get docs by project ID
  async getDocsByProjectId(projectId: number, user?: User) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    console.log(
      'fetching docs for project id...' + projectId + ' ' + new Date().toLocaleString(),
    );

    try {
      const result = await this.drizzleService.db
        .select()
        .from(docs)
        .where(and(eq(docs.projectId, projectId), eq(docs.deleted, false)));

      console.log('docs fetched:' + 'time:' + new Date().toLocaleString());

      if (result.length === 0) {
        return {
          message: `No docs found for project ${projectId}`,
          userId: user?.id || 'anonymous',
          docs: null,
        };
      }

      return {
        message: `docs for project id ${projectId}`,
        userId: user?.id || 'anonymous',
        docs: result[0],
      };
    } catch (error) {
      console.error('Error fetching docs:', error);
      throw error;
    }
  }

  // Get docs by docs ID (kept for backward compatibility if needed)
  async getDocs(id: number, user?: User) {
    if (!id) {
      throw new BadRequestException('Docs ID is required');
    }

    console.log(
      'fetching docs for given id...' + id + ' ' + new Date().toLocaleString(),
    );

    try {
      const result = await this.drizzleService.db
        .select()
        .from(docs)
        .where(and(eq(docs.id, id), eq(docs.deleted, false)));

      console.log('docs fetched:' + 'time:' + new Date().toLocaleString());
      return {
        message: `docs for docs id ${id}`,
        userId: user?.id || 'anonymous',
        docs: result[0] || null,
      };
    } catch (error) {
      console.error('Error fetching docs:', error);
      throw error;
    }
  }

  // Create docs for a project (one-to-one relationship)
  async createDocs(data: { apiDocs?: any }, projId: number, user?: User) {

    if (!projId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      console.log('creating docs...' + new Date().toLocaleString());

      // Check if docs already exist for this project
      const existingDocs = await this.drizzleService.db
        .select()
        .from(docs)
        .where(eq(docs.projectId, projId));

      if (existingDocs.length > 0) {
        throw new ConflictException(`Docs already exist for project ${projId}. Use update instead.`);
      }

      // Create new docs with projectId
      const result = await this.drizzleService.db
        .insert(docs)
        .values({
          projectId: projId,
          apiDocs: data.apiDocs || null,
          version: 1,
          createdBy: user?.id,
        })
        .returning();

      console.log(
        'docs created for project.' +
          'time:' +
          new Date().toLocaleString(),
      );

      return {
        success: true,
        message: `Docs created successfully for project ${projId}`,
        userId: user?.id || 'anonymous',
        docs: result[0],
      };
    } catch (error) {
      console.error('Error creating docs:', error);
      throw error;
    }
  }

  // Update docs by project ID
  async updateDocsByProjectId(projectId: number, data: { apiDocs?: any }, user?: User) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      console.log('updating docs for project...' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .update(docs)
        .set({
          apiDocs: data.apiDocs || null,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.id,
          version: sql`${docs.version} + 1`
        })
        .where(eq(docs.projectId, projectId))
        .returning();

      if (result.length === 0) {
        throw new BadRequestException(`No docs found for project ${projectId}`);
      }

      console.log('docs updated:' + 'time:' + new Date().toLocaleString());

      return {
        success: true,
        message: `Docs updated successfully for project ${projectId}`,
        userId: user?.id || 'anonymous',
        docs: result[0],
      };
    } catch (error) {
      console.error('Error updating docs:', error);
      throw error;
    }
  }

  // Update docs by docs ID (kept for backward compatibility)
  async updateDocs(data: DocsData, user?: User) {
    if (!data.id) throw new BadRequestException('Docs ID is required');

    try {
      console.log('updating docs...' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .update(docs)
        .set({
          apiDocs: data.apiDocs || null,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.id,
          version: sql`${docs.version} + 1`
        })
        .where(eq(docs.id, data.id))
        .returning();

      console.log('docs updated:' + 'time:' + new Date().toLocaleString());

      return {
        success: true,
        message: `Docs updated successfully`,
        userId: user?.id || 'anonymous',
        docs: result[0],
      };
    } catch (error) {
      console.error('Error updating docs:', error);
      throw error;
    }
  }

  // Delete docs by project ID (soft delete)
  async deleteDocsByProjectId(projectId: number, user?: User) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      console.log('deleting docs for project...' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .update(docs)
        .set({
          deleted: true,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.id,
        })
        .where(eq(docs.projectId, projectId))
        .returning();

      if (result.length === 0) {
        throw new BadRequestException(`No docs found for project ${projectId}`);
      }

      console.log('docs deleted:' + 'time:' + new Date().toLocaleString());

      return {
        success: true,
        message: `Docs deleted successfully for project ${projectId}`,
        userId: user?.id || 'anonymous',
      };
    } catch (error) {
      console.error('Error deleting docs:', error);
      throw error;
    }
  }

  // Upsert docs - create if not exists, update if exists
  async upsertDocs(projectId: number, data: { apiDocs?: any }, user?: User) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      // Check if docs exist for this project
      const existingDocs = await this.drizzleService.db
        .select()
        .from(docs)
        .where(eq(docs.projectId, projectId));

      if (existingDocs.length > 0) {
        // Update existing docs
        return this.updateDocsByProjectId(projectId, data, user);
      } else {
        // Create new docs
        return this.createDocs(data, projectId, user);
      }
    } catch (error) {
      console.error('Error upserting docs:', error);
      throw error;
    }
  }
}