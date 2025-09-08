// apps/backend/src/projects/projects.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { DrizzleService } from '../../drizzle/drizzle.service';
import { projects } from '../../drizzle/schema';
import type { User } from '@clerk/backend';
import { eq } from 'drizzle-orm';

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
      .where(eq(projects.orgId, orgId));

    return {
      message: `Projects for organization ${orgId}`,
      organizationId: orgId,
      userId: user?.id || 'anonymous',
      projects: projectsList,
      totalCount: projectsList.length,
    };
  }
}
