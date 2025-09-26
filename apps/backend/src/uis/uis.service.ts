import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { uis, versions, projects } from '../../drizzle/schema';
import { eq, and, desc, max, sql } from 'drizzle-orm';
import {User} from '@superatom-turbo/trpc';

@Injectable()
export class UisService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAllUis(
    filters: {
      projectId?: number;
      uiId?: string;
      orgId?: string;
      where?: any;
      orderBy?: any;
      limit?: number;
      skip?: number;
    },
    user?: User
  ) {
    // Build the query with joins in a single query
    let query = this.drizzleService.db
      .select({
        // UI fields
        id: uis.id,
        projectId: uis.projectId,
        createdAt: uis.createdAt,
        updatedAt: uis.updatedAt,
        published: uis.published,
        uiId: uis.uiId,
        deleted: uis.deleted,
        createdBy: uis.createdBy,
        updatedBy: uis.updatedBy,
        uiVersion: uis.uiVersion,
        name: uis.name,
        description: uis.description,
        // Latest version using subquery
        version_id: sql<number>`COALESCE((
          SELECT MAX(${versions.versionId})
          FROM ${versions}
          WHERE ${versions.uiId} = ${uis.uiId}
        ), 1)`.as('version_id'),
        // Project info for orgId filtering
        project_orgId: filters.orgId ? projects.orgId : sql<string>`NULL`.as('project_orgId'),
      })
      .from(uis);

    // Join with projects only if orgId filter is needed
    if (filters.orgId) {
      query = query.leftJoin(projects, and(
        eq(uis.projectId, projects.id),
        eq(projects.deleted, false)
      ));
    }

    // Build where conditions
    let whereConditions: any = [eq(uis.deleted, false)];

    // If projectId is provided, filter by it
    if (filters.projectId) {
      whereConditions.push(eq(uis.projectId, filters.projectId));
    }

    // If uiId is provided, filter by it
    if (filters.uiId) {
      whereConditions.push(eq(uis.uiId, filters.uiId));
    }

    // If orgId is provided, filter by project's orgId
    if (filters.orgId) {
      whereConditions.push(eq(projects.orgId, filters.orgId));
    }

    // Apply additional where conditions if provided
    if (filters.where) {
      Object.keys(filters.where).forEach(key => {
        if (key in uis && filters.where[key] !== undefined) {
          whereConditions.push(eq((uis as any)[key], filters.where[key]));
        }
      });
    }

    // Apply where conditions
    query = query.where(and(...whereConditions));

    // Apply ordering
    if (filters.orderBy) {
      const orderField = Object.keys(filters.orderBy)[0];
      const orderDirection = filters.orderBy[orderField];
      if (orderField in uis) {
        query = orderDirection === 'desc'
          ? query.orderBy(desc((uis as any)[orderField]))
          : query.orderBy((uis as any)[orderField]);
      }
    } else {
      // Default ordering by creation date
      query = query.orderBy(desc(uis.createdAt));
    }

    // Apply pagination
    if (filters.skip) {
      query = query.offset(filters.skip);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    // Execute the single query
    const uisWithLatestVersion = await query;

    // Remove the project_orgId field from results as it was only for filtering
    const cleanedUis = uisWithLatestVersion.map((ui: any) => {
      const { project_orgId, ...rest } = ui;
      return rest;
    });

    return {
      message: `Found ${cleanedUis.length} UIs`,
      uis: cleanedUis,
      totalCount: cleanedUis.length,
      userId: user?.id || 'anonymous',
    };
  }

 async getUiById(id: string, user?: User) {
  // Single query to get UI with latest version
  const result = await this.drizzleService.db
    .select({
      // UI fields
      id: uis.id,
      projectId: uis.projectId,
      createdAt: uis.createdAt,
      updatedAt: uis.updatedAt,
      published: uis.published,
      uiId: uis.uiId,
      deleted: uis.deleted,
      createdBy: uis.createdBy,
      updatedBy: uis.updatedBy,
      uiVersion: uis.uiVersion,
      name: uis.name,
      description: uis.description,
      // Latest version using subquery
      version_id: sql<number>`COALESCE((
        SELECT MAX(${versions.versionId})
        FROM ${versions}
        WHERE ${versions.uiId} = ${uis.uiId}
      ), 1)`.as('version_id'),
    })
    .from(uis)
    .where(and(eq(uis.uiId, id), eq(uis.deleted, false)))
    .limit(1);

  if (!result.length) {
    throw new NotFoundException(`UI with ID ${id} not found`);
  }

  return {
    message: `UI ${id} retrieved successfully`,
    ui: result[0],
    userId: user?.id || 'anonymous',
  };
}


  async createUi(
    data: {
      uiId: string;
      uiVersion: number;
      name: string;
      description?: string;
      projectId: number;
    },
    user?: User
  ) {
    if (!data.projectId) {
      throw new BadRequestException('Project ID is required');
    }

    if (!data.name?.trim()) {
      throw new BadRequestException('UI name is required');
    }

    if (!data.uiId?.trim()) {
      throw new BadRequestException('UI ID is required');
    }

    console.log("creating UI... with name: " + data.name +  new Date().toLocaleString());

    console.log("checking if project exists..." + new Date().toLocaleString());
    // Verify project exists
    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.deleted, false)))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${data.projectId} not found`);
    }
    console.log("found the project..." + new Date().toLocaleString());


    console.log("creating the ui..." + new Date().toLocaleString());
    // Create the UI
    const newUi = await this.drizzleService.db
      .insert(uis)
      .values({
        uiId: data.uiId,
        uiVersion: data.uiVersion,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        projectId: data.projectId,
        createdBy: user?.id || null,
        updatedBy: user?.id || null,
      })
      .returning();

    console.log("created the ui..." + new Date().toLocaleString());

    // Update project's updated_at timestamp
    await this.drizzleService.db
      .update(projects)
      .set({
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || null,
      })
      .where(eq(projects.id, data.projectId));
    console.log("updated the project..." + new Date().toLocaleString() + " and sending back the response..." + new Date().toLocaleString());

    return {
      message: 'UI created successfully',
      ui: newUi[0],
      userId: user?.id || 'anonymous',
    };
  }

  async updateUi(
    id: number,
    data: {
      name?: string;
      description?: string;
      published?: boolean;
      uiVersion?: number;
    },
    user?: User
  ) {
    // Check if UI exists
    const existingUi = await this.drizzleService.db
      .select()
      .from(uis)
      .where(and(eq(uis.id, id), eq(uis.deleted, false)))
      .limit(1);

    if (!existingUi.length) {
      throw new NotFoundException(`UI with ID ${id} not found`);
    }

    const updateData: any = {
      updatedBy: user?.id || null,
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new BadRequestException('UI name cannot be empty');
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    if (data.published !== undefined) {
      updateData.published = data.published;
    }

    if (data.uiVersion !== undefined) {
      updateData.uiVersion = data.uiVersion;
    }

    const updatedUi = await this.drizzleService.db
      .update(uis)
      .set(updateData)
      .where(eq(uis.id, id))
      .returning();

    // Update project's updated_at timestamp
    await this.drizzleService.db
      .update(projects)
      .set({
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || null,
      })
      .where(eq(projects.id, existingUi[0].projectId));

    return {
      message: 'UI updated successfully',
      ui: updatedUi[0],
      userId: user?.id || 'anonymous',
    };
  }

  async deleteUi(id: number, user?: User) {
    // Check if UI exists
    const existingUi = await this.drizzleService.db
      .select()
      .from(uis)
      .where(and(eq(uis.id, id), eq(uis.deleted, false)))
      .limit(1);

    if (!existingUi.length) {
      throw new NotFoundException(`UI with ID ${id} not found`);
    }

    // Soft delete - set deleted flag to true
    const deletedUi = await this.drizzleService.db
      .update(uis)
      .set({
        deleted: true,
        updatedBy: user?.id || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(uis.id, id))
      .returning();

    // Update project's updated_at timestamp
    await this.drizzleService.db
      .update(projects)
      .set({
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || null,
      })
      .where(eq(projects.id, existingUi[0].projectId));

    return {
      message: 'UI deleted successfully',
      ui: deletedUi[0],
      userId: user?.id || 'anonymous',
    };
  }
}