// apps/backend/src/projects/projects.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { projects, uis } from '../../drizzle/schema';
import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import { User } from '@superatom-turbo/trpc';

@Injectable()
export class ProjectsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getAllProjects(orgId: string, user?: User, limit = 8, skip = 0) {
  if (!orgId) {
    throw new BadRequestException("Organization ID is required");
  }

  // --- Total count query (efficient)
  const [{ count: totalCount }] = await this.drizzleService.db
    .select({ count: sql<number>`COUNT(*)` })
    .from(projects)
    .where(and(eq(projects.orgId, orgId), eq(projects.deleted, false)));

  // --- Paginated query
  const results = await this.drizzleService.db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdAt: sql<string>`to_char(${projects.createdAt}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
      updatedAt: sql<string>`to_char(${projects.updatedAt}, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`,
      deleted: projects.deleted,
      orgId: projects.orgId,
      createdBy: projects.createdBy,
      updatedBy: projects.updatedBy,
    })
    .from(projects)
    .where(and(eq(projects.orgId, orgId), eq(projects.deleted, false)))
    .orderBy(desc(projects.updatedAt))
    .limit(limit)
    .offset(skip);

  // --- Fetch uis_count for these projects
  const projectIds = results.map((p: { id: any; }) => p.id);
  let uisCounts: Record<string, number> = {};

  if (projectIds.length > 0) {
    const uisCountRows = await this.drizzleService.db
      .select({
        projectId: uis.projectId,
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(uis)
      .where(and(inArray(uis.projectId, projectIds), eq(uis.deleted, false)))
      .groupBy(uis.projectId);

    uisCounts = uisCountRows.reduce(
      (acc: any, row: { projectId: any; count: any; }) => ({ ...acc, [row.projectId]: row.count }),
      {}
    );
  }

  // --- Merge counts
  const projectsWithCounts = results.map((project: { id: string | number; }) => ({
    ...project,
    uis_count: uisCounts[project.id] ?? 0,
  }));

  return {
    message: `Projects for organization ${orgId}`,
    organizationId: orgId,
    userId: user?.id || "anonymous",
    totalCount,
    projects: projectsWithCounts,
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
