// src/projects/projects.service.ts
import { BadRequestException, Injectable, Query } from "@nestjs/common";
import { DrizzleService } from "../../drizzle/drizzle.service";
import { projects } from "../../drizzle/schema";
import { CurrentUser } from "src/decorators/current-user.decorator";
import type { User } from "@clerk/backend";
import { eq } from "drizzle-orm";

@Injectable()
export class ProjectsService {
  constructor(private readonly drizzleService: DrizzleService) {}

async getAllProjects(orgId: string, user: User) {
  if (!orgId) {
    throw new BadRequestException('Organization ID is required');
  }

  console.log("getting the projects");
  const projectsList = await this.drizzleService.db
    .select()
    .from(projects)
    .where(eq(projects.orgId, orgId));
  
  console.log("projectsList sent", );

  return {
    message: `Projects for organization ${orgId}`,
    organizationId: orgId,
    userId: user.id,
    projects: projectsList,
    totalCount: projectsList.length,
  };
}

}