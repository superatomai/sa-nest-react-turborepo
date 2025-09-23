import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { designSystem, projects } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { User } from '@superatom-turbo/trpc';

@Injectable()
export class DesignSystemService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getDesignSystemByProjectId(projectId: number, orgId: string, user?: User) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    // First verify project exists and belongs to org
    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const designSystemResult = await this.drizzleService.db
      .select()
      .from(designSystem)
      .where(eq(designSystem.projectId, projectId))
      .limit(1);

    return {
      message: `Design system for project ${projectId} retrieved successfully`,
      designSystem: designSystemResult.length ? designSystemResult[0] : null,
      projectId,
      userId: user?.id || 'anonymous',
    };
  }

  async createDesignSystem(
    data: {
      projectId: number;
      colors?: any;
      typography?: any;
      spacing?: any;
      borders?: any;
      shadows?: any;
      buttons?: any;
      images?: any;
      misc?: any;
      designNotes?: string;
    },
    orgId: string,
    user?: User
  ) {
    if (!data.projectId) {
      throw new BadRequestException('Project ID is required');
    }
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Verify project exists and belongs to org
    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, data.projectId),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${data.projectId} not found`);
    }

    // Check if design system already exists for this project
    const existingDesignSystem = await this.drizzleService.db
      .select()
      .from(designSystem)
      .where(eq(designSystem.projectId, data.projectId))
      .limit(1);

    if (existingDesignSystem.length) {
      throw new BadRequestException(`Design system already exists for project ${data.projectId}`);
    }

    const newDesignSystem = await this.drizzleService.db
      .insert(designSystem)
      .values({
        projectId: data.projectId,
        colors: data.colors || null,
        typography: data.typography || null,
        spacing: data.spacing || null,
        borders: data.borders || null,
        shadows: data.shadows || null,
        buttons: data.buttons || null,
        images: data.images || null,
        misc: data.misc || null,
        designNotes: data.designNotes?.trim() || null,
      })
      .returning();

    return {
      message: 'Design system created successfully',
      designSystem: newDesignSystem[0],
      userId: user?.id || 'anonymous',
    };
  }

  async updateDesignSystem(
    projectId: number,
    data: {
      colors?: any;
      typography?: any;
      spacing?: any;
      borders?: any;
      shadows?: any;
      buttons?: any;
      images?: any;
      misc?: any;
      designNotes?: string;
    },
    orgId: string,
    user?: User
  ) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Verify project exists and belongs to org
    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if design system exists
    const existingDesignSystem = await this.drizzleService.db
      .select()
      .from(designSystem)
      .where(eq(designSystem.projectId, projectId))
      .limit(1);

    if (!existingDesignSystem.length) {
      throw new NotFoundException(`Design system not found for project ${projectId}`);
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (data.colors !== undefined) updateData.colors = data.colors;
    if (data.typography !== undefined) updateData.typography = data.typography;
    if (data.spacing !== undefined) updateData.spacing = data.spacing;
    if (data.borders !== undefined) updateData.borders = data.borders;
    if (data.shadows !== undefined) updateData.shadows = data.shadows;
    if (data.buttons !== undefined) updateData.buttons = data.buttons;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.misc !== undefined) updateData.misc = data.misc;
    if (data.designNotes !== undefined) {
      updateData.designNotes = data.designNotes?.trim() || null;
    }

    const updatedDesignSystem = await this.drizzleService.db
      .update(designSystem)
      .set(updateData)
      .where(eq(designSystem.projectId, projectId))
      .returning();

    return {
      message: 'Design system updated successfully',
      designSystem: updatedDesignSystem[0],
      userId: user?.id || 'anonymous',
    };
  }

  async deleteDesignSystem(projectId: number, orgId: string, user?: User) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Verify project exists and belongs to org
    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Check if design system exists
    const existingDesignSystem = await this.drizzleService.db
      .select()
      .from(designSystem)
      .where(eq(designSystem.projectId, projectId))
      .limit(1);

    if (!existingDesignSystem.length) {
      throw new NotFoundException(`Design system not found for project ${projectId}`);
    }

    // Hard delete design system
    const deletedDesignSystem = await this.drizzleService.db
      .delete(designSystem)
      .where(eq(designSystem.projectId, projectId))
      .returning();

    return {
      message: 'Design system deleted successfully',
      designSystem: deletedDesignSystem[0],
      userId: user?.id || 'anonymous',
    };
  }

  // Helper method to create or update design system
  async upsertDesignSystem(
    projectId: number,
    data: {
      colors?: any;
      typography?: any;
      spacing?: any;
      borders?: any;
      shadows?: any;
      buttons?: any;
      images?: any;
      misc?: any;
      designNotes?: string;
    },
    orgId: string,
    user?: User
  ) {
    const existing = await this.getDesignSystemByProjectId(projectId, orgId, user);

    if (existing.designSystem) {
      return this.updateDesignSystem(projectId, data, orgId, user);
    } else {
      return this.createDesignSystem({ projectId, ...data }, orgId, user);
    }
  }
}