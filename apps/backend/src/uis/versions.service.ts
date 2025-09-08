import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { versions, uis } from '../../drizzle/schema';
// import type { User } from '@clerk/backend';
import { eq, and, desc, max, sql } from 'drizzle-orm';
import { User } from '@superatom-turbo/trpc';

@Injectable()
export class VersionsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async createVersion(
  data: {
    uiId: string;
    dsl: any;
    prompt: string;
  },
  user?: User
) {
  if (!data.uiId?.trim()) {
    throw new BadRequestException('UI ID is required');
  }

  if (!data.prompt?.trim()) {
    throw new BadRequestException('Prompt is required');
  }

  if (!data.dsl) {
    throw new BadRequestException('DSL is required');
  }

  // Find the latest version for this uiId
  const latestVersion = await this.drizzleService.db
    .select()
    .from(versions)
    .where(eq(versions.uiId, data.uiId))
    .orderBy(desc(versions.versionId))
    .limit(1);

  // Increment or set to 1 if no version exists
  const nextVersionId = (latestVersion[0]?.versionId ?? 0) + 1;

  // Create the new version
  const newVersion = await this.drizzleService.db
    .insert(versions)
    .values({
      uiId: data.uiId,
      dsl: typeof data.dsl === "object" ? JSON.stringify(data.dsl) : data.dsl,
      prompt: data.prompt.trim(),
      versionId: nextVersionId,
      createdBy: user?.id || null,
      updatedBy: user?.id || null,
    })
    .returning();

  return {
    message: `Version ${nextVersionId} created successfully for UI ${data.uiId}`,
    version: newVersion[0],
    userId: user?.id || 'anonymous',
  };
}


  async getAllVersions(
    filters: {
      uiId?: string;
      where?: any;
      orderBy?: any;
      limit?: number;
      skip?: number;
    },
    user?: User
  ) {
    let whereConditions: any = [eq(versions.deleted, false)];

    // Filter by UI ID if provided
    if (filters.uiId) {
      whereConditions.push(eq(versions.uiId, filters.uiId));
    }

    // Apply additional where conditions if provided
    if (filters.where) {
      Object.keys(filters.where).forEach(key => {
        if (key in versions && filters.where[key] !== undefined) {
          whereConditions.push(eq((versions as any)[key], filters.where[key]));
        }
      });
    }

    // Build query
    let query = this.drizzleService.db
      .select()
      .from(versions)
      .where(and(...whereConditions));

    // Apply ordering
    if (filters.orderBy) {
      const orderField = Object.keys(filters.orderBy)[0];
      const orderDirection = filters.orderBy[orderField];
      if (orderField in versions) {
        query = orderDirection === 'desc' 
          ? query.orderBy(desc((versions as any)[orderField]))
          : query.orderBy((versions as any)[orderField]);
      }
    } else {
      // Default ordering by version ID descending (latest first)
      query = query.orderBy(desc(versions.versionId), desc(versions.createdAt));
    }

    // Apply pagination
    if (filters.skip) {
      query = query.offset(filters.skip);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const versionsList = await query;

    return {
      message: `Found ${versionsList.length} versions`,
      versions: versionsList,
      totalCount: versionsList.length,
      userId: user?.id || 'anonymous',
    };
  }

  async getVersionById(id: number, user?: User) {
    const version = await this.drizzleService.db
      .select()
      .from(versions)
      .where(and(eq(versions.id, id), eq(versions.deleted, false)))
      .limit(1);

    if (!version.length) {
      throw new NotFoundException(`Version with ID ${id} not found`);
    }

    return {
      message: `Version ${id} retrieved successfully`,
      version: version[0],
      userId: user?.id || 'anonymous',
    };
  }

  async getVersionByUiAndVersion(uiId: string, versionId: number, user?: User) {
    const version = await this.drizzleService.db
      .select()
      .from(versions)
      .where(and(
        eq(versions.uiId, uiId),
        eq(versions.versionId, versionId),
        eq(versions.deleted, false)
      ))
      .limit(1);

    if (!version.length) {
      throw new NotFoundException(`Version ${versionId} for UI ${uiId} not found`);
    }

    return {
      message: `Version ${versionId} for UI ${uiId} retrieved successfully`,
      version: version[0],
      userId: user?.id || 'anonymous',
    };
  }

  async getLatestVersionForUi(uiId: string, user?: User) {
    const latestVersion = await this.drizzleService.db
      .select()
      .from(versions)
      .where(and(eq(versions.uiId, uiId), eq(versions.deleted, false)))
      .orderBy(desc(versions.versionId))
      .limit(1);

    if (!latestVersion.length) {
      throw new NotFoundException(`No versions found for UI ${uiId}`);
    }

    return {
      message: `Latest version for UI ${uiId} retrieved successfully`,
      version: latestVersion[0],
      userId: user?.id || 'anonymous',
    };
  }

  async updateVersion(
    id: number,
    data: {
      dsl?: any;
      prompt?: string;
    },
    user?: User
  ) {
    // Check if version exists
    const existingVersion = await this.drizzleService.db
      .select()
      .from(versions)
      .where(and(eq(versions.id, id), eq(versions.deleted, false)))
      .limit(1);

    if (!existingVersion.length) {
      throw new NotFoundException(`Version with ID ${id} not found`);
    }

    const updateData: any = {
      updatedBy: user?.id || null,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    };

    if (data.dsl !== undefined) {
      updateData.dsl = typeof data.dsl === "object" ? JSON.stringify(data.dsl) : data.dsl;
    }

    if (data.prompt !== undefined) {
      if (!data.prompt.trim()) {
        throw new BadRequestException('Prompt cannot be empty');
      }
      updateData.prompt = data.prompt.trim();
    }

    const updatedVersion = await this.drizzleService.db
      .update(versions)
      .set(updateData)
      .where(eq(versions.id, id))
      .returning();

    return {
      message: 'Version updated successfully',
      version: updatedVersion[0],
      userId: user?.id || 'anonymous',
    };
  }

  async deleteVersion(id: number, user?: User) {
    // Check if version exists
    const existingVersion = await this.drizzleService.db
      .select()
      .from(versions)
      .where(and(eq(versions.id, id), eq(versions.deleted, false)))
      .limit(1);

    if (!existingVersion.length) {
      throw new NotFoundException(`Version with ID ${id} not found`);
    }

    // Soft delete - set deleted flag to true
    const deletedVersion = await this.drizzleService.db
      .update(versions)
      .set({
        deleted: true,
        updatedBy: user?.id || null,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(versions.id, id))
      .returning();

    return {
      message: 'Version deleted successfully',
      version: deletedVersion[0],
      userId: user?.id || 'anonymous',
    };
  }

  async getVersionStats(uiId?: string, user?: User) {
    let whereConditions: any = [eq(versions.deleted, false)];
    
    if (uiId) {
      whereConditions.push(eq(versions.uiId, uiId));
    }

    const stats = await this.drizzleService.db
      .select({
        totalVersions: sql<number>`count(*)`,
        latestVersionId: max(versions.versionId),
      })
      .from(versions)
      .where(and(...whereConditions));

    const uniqueUis = await this.drizzleService.db
      .select({
        uniqueUiCount: sql<number>`count(distinct ${versions.uiId})`,
      })
      .from(versions)
      .where(and(...whereConditions));

    return {
      message: 'Version statistics retrieved successfully',
      stats: {
        totalVersions: stats[0]?.totalVersions || 0,
        latestVersionId: stats[0]?.latestVersionId || 0,
        uniqueUiCount: uniqueUis[0]?.uniqueUiCount || 0,
      },
      userId: user?.id || 'anonymous',
    };
  }
}