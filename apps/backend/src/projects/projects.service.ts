// apps/backend/src/projects/projects.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { projects } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { User } from '@superatom-turbo/trpc';

@Injectable()
export class ProjectsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAllProjects(orgId: string, user?: User) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    const projectsList = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(eq(projects.orgId, orgId), eq(projects.deleted, false)));

    return {
      message: `Projects for organization ${orgId}`,
      organizationId: orgId,
      userId: user?.id || 'anonymous',
      projects: projectsList,
      totalCount: projectsList.length,
    };
  }

  async getProjectById(id: number, orgId: string, user?: User) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    const project = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!project.length) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      message: `Project ${id} retrieved successfully`,
      project: project[0],
      userId: user?.id || 'anonymous',
    };
  }

  async createProject(
    data: {
      name: string;
      description?: string;
      orgId: string;
    },
    user?: User
  ) {
    if (!data.orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    if (!data.name?.trim()) {
      throw new BadRequestException('Project name is required');
    }

    const newProject = await this.drizzleService.db
      .insert(projects)
      .values({
        name: data.name.trim(),
        description: data.description?.trim() || null,
        orgId: data.orgId,
        createdBy: user?.id || null,
        updatedBy: user?.id || null,
      })
      .returning();

    return {
      message: 'Project created successfully',
      project: newProject[0],
      userId: user?.id || 'anonymous',
    };
  }

  async updateProject(
    id: number,
    data: {
      name?: string;
      description?: string;
    },
    orgId: string,
    user?: User
  ) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Check if project exists and belongs to the organization
    const existingProject = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!existingProject.length) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updateData: any = {
      updatedBy: user?.id || null,
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new BadRequestException('Project name cannot be empty');
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description?.trim() || null;
    }

    const updatedProject = await this.drizzleService.db
      .update(projects)
      .set(updateData)
      .where(and(
        eq(projects.id, id),
        eq(projects.orgId, orgId)
      ))
      .returning();

    return {
      message: 'Project updated successfully',
      project: updatedProject[0],
      userId: user?.id || 'anonymous',
    };
  }

  async deleteProject(id: number, orgId: string, user?: User) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    // Check if project exists and belongs to the organization
    const existingProject = await this.drizzleService.db
      .select()
      .from(projects)
      .where(and(
        eq(projects.id, id),
        eq(projects.orgId, orgId),
        eq(projects.deleted, false)
      ))
      .limit(1);

    if (!existingProject.length) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Soft delete - set deleted flag to true
    const deletedProject = await this.drizzleService.db
      .update(projects)
      .set({
        deleted: true,
        updatedBy: user?.id || null,
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(projects.id, id),
        eq(projects.orgId, orgId)
      ))
      .returning();

    return {
      message: 'Project deleted successfully',
      project: deletedProject[0],
      userId: user?.id || 'anonymous',
    };
  }
}
