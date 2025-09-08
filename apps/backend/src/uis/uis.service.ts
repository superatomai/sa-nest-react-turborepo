import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { uis, versions, projects } from '../../drizzle/schema';
import type { User } from '@clerk/backend';
import { eq, and, desc, max, sql } from 'drizzle-orm';

@Injectable()
export class UisService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAllUis(
    filters: {
      projectId?: number;
      orgId?: string;
      where?: any;
      orderBy?: any;
      limit?: number;
      skip?: number;
    },
    user?: User
  ) {
    let whereConditions: any = [eq(uis.deleted, false)];

    // If projectId is provided, filter by it
    if (filters.projectId) {
      whereConditions.push(eq(uis.projectId, filters.projectId));
    }

    // If orgId is provided, we need to join with projects to filter
    if (filters.orgId) {
      // This will require a join - we'll handle this with a subquery
      const projectIds = await this.drizzleService.db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.orgId, filters.orgId), eq(projects.deleted, false)));
      
      const validProjectIds = projectIds.map((p: { id: number }) => p.id);
      if (validProjectIds.length > 0) {
        whereConditions.push(sql`${uis.projectId} IN ${validProjectIds}`);
      } else {
        // No valid projects found for this org
        return {
          message: 'No UIs found for the specified organization',
          uis: [],
          totalCount: 0,
          userId: user?.id || 'anonymous',
        };
      }
    }

    // Apply additional where conditions if provided
    if (filters.where) {
      Object.keys(filters.where).forEach(key => {
        if (key in uis && filters.where[key] !== undefined) {
          whereConditions.push(eq((uis as any)[key], filters.where[key]));
        }
      });
    }

    // Build query
    let query = this.drizzleService.db
      .select()
      .from(uis)
      .where(and(...whereConditions));

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

    const uisList = await query;

    // Get latest versions for each UI
    const uiIds = uisList.map((ui:any) => ui.uiId);
    let latestVersions: any[] = [];
    
    if (uiIds.length > 0) {
      latestVersions = await this.drizzleService.db
        .select({
          uiId: versions.uiId,
          maxVersionId: max(versions.versionId),
        })
        .from(versions)
        .where(sql`${versions.uiId} IN ${uiIds}`)
        .groupBy(versions.uiId);
    }

    // Combine UIs with their latest version info
    const uisWithLatestVersion = uisList.map((ui: any) => {
      const latestVersion = latestVersions.find((v: any) => v.uiId === ui.uiId);
      return {
        ...ui,
        version_id: latestVersion?.maxVersionId || 1,
      };
    });

    return {
      message: `Found ${uisWithLatestVersion.length} UIs`,
      uis: uisWithLatestVersion,
      totalCount: uisWithLatestVersion.length,
      userId: user?.id || 'anonymous',
    };
  }

  async getUiById(id: number, user?: User) {
    const ui = await this.drizzleService.db
      .select()
      .from(uis)
      .where(and(eq(uis.id, id), eq(uis.deleted, false)))
      .limit(1);

    if (!ui.length) {
      throw new NotFoundException(`UI with ID ${id} not found`);
    }

    // Get latest version for this UI
    const latestVersion = await this.drizzleService.db
      .select({ maxVersionId: max(versions.versionId) })
      .from(versions)
      .where(eq(versions.uiId, ui[0].uiId))
      .groupBy(versions.uiId);

    return {
      message: `UI ${id} retrieved successfully`,
      ui: {
        ...(ui[0] as any),
        version_id: latestVersion[0]?.maxVersionId || 1,
      },
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

    // Verify project exists
    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, data.projectId), eq(projects.deleted, false)))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${data.projectId} not found`);
    }

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

    // Update project's updated_at timestamp
    await this.drizzleService.db
      .update(projects)
      .set({
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || null,
      })
      .where(eq(projects.id, data.projectId));

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