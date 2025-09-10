import { User } from '@clerk/backend';
import { BadRequestException, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DrizzleService } from 'drizzle/drizzle.service';
import { docs, projects } from 'drizzle/schema';
import { version } from 'os';

interface DocsData {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
  docs: any;
}

@Injectable()
export class DocsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getDocs(id: number, user?: User) {
    if (!id) {
      throw new BadRequestException('Docs ID is required');
    }

    console.log(
      'fetching docs for given id...' + id + ' ' + new Date().toLocaleString(),
    );

    try {
      // Single query: projects + count of UIs per project
      const result = await this.drizzleService.db
        .select({
          ...docs,
        })
        .from(docs)
        .where(and(eq(docs.id, id), eq(docs.deleted, false)));

      console.log('docs fetched:' + 'time:' + new Date().toLocaleString());
      return {
        message: `docs for docs id ${id}`,
        userId: user?.id || 'anonymous',
        docs: result,
      };
    } catch (error) {
      console.error('Error fetching docs:', error);
      return error;
    }
  }

  async createDocs(data: DocsData, projId: number, user?: User) {
    if (data.docs.length === 0 || !data.docs) {
      throw new BadRequestException('Docs is required');
    }

    if (!projId) {
      throw new BadRequestException('Project ID is required');
    }

    try {
      console.log('creating docs...' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .insert(docs)
        .values({
          docs: data.docs,
          version: 1,
        })
        .returning();

      // updating the projects with docs.
      const updateProject = await this.drizzleService.db
        .update(projects)
        .set({
          docs: result[0].id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, projId));

      console.log(
        'docs created and updated the projects.' +
          'time:' +
          new Date().toLocaleString(),
      );

      return {
        success: true,
        message: `Docs created successfully`,
        userId: user?.id || 'anonymous',
        docs: result,
      };
    } catch (error) {
      console.error('Error creating docs:', error);
      return error;
    }
  }

  async updateDocs(data: DocsData, user?: User) {
  if (!data.id) throw new BadRequestException('Docs ID is required');
  if (!data.docs || data.docs.length === 0) {
    throw new BadRequestException('Docs content is required');
  }

  try {
    console.log('updating docs...' + new Date().toLocaleString());

    const result = await this.drizzleService.db
      .update(docs)
      .set({
        docs: data.docs,
        updatedAt: new Date().toISOString(),
        version: sql`${docs.version} + 1` 
      })
      .where(eq(docs.id, data.id))
      .returning(); 

    console.log('docs updated:' + 'time:' + new Date().toLocaleString());

    return {
      success: true,
      message: `Docs updated successfully`,
      userId: user?.id || 'anonymous',
      docs: result, 
    };
  } catch (error) {
    console.error('Error updating docs:', error);
    return error;
  }
}
}
