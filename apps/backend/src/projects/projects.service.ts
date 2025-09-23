// apps/backend/src/projects/projects.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { projects, uis, designSystem } from '../../drizzle/schema';
import { eq, and, sql, inArray, desc, count } from 'drizzle-orm';
import { User } from '@superatom-turbo/trpc';
import { time, timeStamp } from 'console';

@Injectable()
export class ProjectsService {
  constructor(private readonly drizzleService: DrizzleService) {}

// Optimized projects.service.ts
async getAllProjects(orgId: string, user?: User, limit = 8, skip = 0) {
  if (!orgId) {
    throw new BadRequestException("Organization ID is required");
  }

  console.log("fetching all projects...", new Date().toLocaleString());

  try {
    // Select only the columns you need
    const results = await this.drizzleService.db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        orgId: projects.orgId,
        uis_count: sql<number>`COALESCE(u_count.count, 0)` // count of UIs per project
      })
      .from(projects)
      // LATERAL join to count UIs
      .leftJoin(
        sql`LATERAL (
          SELECT COUNT(*) AS count
          FROM ${uis} u
          WHERE u.project_id = ${projects.id} AND u.deleted = false
        ) u_count ON true`
      )
      .where(and(eq(projects.orgId, orgId), eq(projects.deleted, false)))
      .orderBy(desc(projects.updatedAt))
      .limit(limit)
      .offset(skip);

    const totalCount = results.length;

    console.log("projects fetched:" + " time:" + new Date().toLocaleString());
    return {
      message: `Projects for organization ${orgId}`,
      organizationId: orgId,
      userId: user?.id || "anonymous",
      totalCount,
      projects: results,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return error;
  }
}


async getProjectWithDocsAndUi(projId: number, user?: User){
    if (!projId) {
    throw new BadRequestException("Project ID is required");
  }

  console.log("Fetching minimal projects...", new Date().toLocaleString());

  try {
    const result = await this.drizzleService.db
      .select({
        id: projects.id,
        name: projects.name,
        docs: projects.docs,
        uiList: projects.uiList,
      })
      .from(projects)
      .where(and(eq(projects.id, projId), eq(projects.deleted, false)))
      .orderBy(desc(projects.updatedAt))

    console.log("Minimal projects fetched:" + " time: " + new Date().toLocaleString());
    return {
      message: `Minimal project data for project ${result[0].name}`,
      projectId: projId,
      userId: user?.id || "anonymous",
      project: result,
    };
  } catch (error) {
    console.error("Error fetching minimal projects:", error);
    throw error;
  }
}


  async getProjectById(id: number, orgId: string, user?: User) {
    if (!orgId) {
      throw new BadRequestException('Organization ID is required');
    }

    const project = await this.drizzleService.db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        orgId: projects.orgId,
        globalInst: projects.globalInst,
        docs: projects.docs,
        uiList: projects.uiList,
        createdBy: projects.createdBy,
        updatedBy: projects.updatedBy,
        deleted: projects.deleted
      })
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

    console.log("started project creation..." + new Date().toLocaleString());

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

      console.log("project created..." + new Date().toLocaleString());

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

    // Delete associated design system first (hard delete since it's project-specific)
    await this.drizzleService.db
      .delete(designSystem)
      .where(eq(designSystem.projectId, id));

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
