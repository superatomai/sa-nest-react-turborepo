import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { User } from '@clerk/backend';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getAllProjects(
    @Query('orgId') orgId: string,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.getAllProjects(orgId, user);
  }
}
