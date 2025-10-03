import { Injectable, Logger } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { UisService } from '../uis/uis.service';
import { VersionsService } from '../uis/versions.service';
import { DesignSystemService } from '../design_system/design_system.service';
import { COMPLEX_DSL } from '../utils/complex-dsl';
import { getNanoid } from '../utils/nanoid';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly uisService: UisService,
    private readonly versionsService: VersionsService,
    private readonly designSystemService: DesignSystemService,
  ) {}

  async handleOrganizationCreated(orgData: any) {
    try {
      this.logger.log(`Creating demo content for organization: ${orgData.id}`);

      const orgId = orgData.id;
      const orgName = orgData.name || 'New Organization';

      // Create a demo project
      const demoProject = await this.projectsService.createProject({
        name: `Demo Project`,
        description: 'This is your demo project! Explore the features and see how easy it is to build UIs with our platform. Feel free to modify or delete this project.',
        orgId: orgId
      });

      const projectId = demoProject.project.id;
      this.logger.log(`Created demo project with ID: ${projectId}`);

      // Create a demo design system
      await this.designSystemService.createDesignSystem({
        projectId: projectId,
        designNotes: `# Welcome to Your Design System

This is your demo design system! Here you can document:

## Brand Colors
- Primary: #3B82F6 (Blue)
- Secondary: #10B981 (Green)
- Accent: #8B5CF6 (Purple)

## Typography
- Headings: Inter, sans-serif
- Body: System fonts for readability

## Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Components
Document your reusable components here as you build them!

Feel free to customize this documentation for your brand and design requirements.`,
        colors: {
          primary: '#3B82F6',
          secondary: '#10B981',
          accent: '#8B5CF6',
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            500: '#6B7280',
            900: '#111827'
          }
        },
        typography: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['Fira Code', 'monospace']
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem'
          }
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
          '2xl': '48px'
        }
      }, orgId);

      this.logger.log(`Created demo design system for project: ${projectId}`);

      // Generate a unique UI ID
      const uiId = "ui" + getNanoid();

      // 1. Create version FIRST (following frontend pattern)
      const demoVersion = await this.versionsService.createVersion({
        uiId: uiId,
        dsl: COMPLEX_DSL,
        prompt: 'Initial demo dashboard with sidebar navigation, stats cards, profile form, and settings form. Features a modern design with Tailwind CSS styling.'
      });

      this.logger.log(`Created demo version for UI: ${uiId}`);

      // 2. Create UI SECOND (following frontend pattern)
      const demoUI = await this.uisService.createUi({
        uiId: uiId,
        name: 'Demo Dashboard',
        description: 'A beautiful dashboard interface showcasing forms, navigation, and data visualization components. Perfect for getting started!',
        projectId: projectId,
        uiVersion: demoVersion.version.id
      });

      this.logger.log(`Created demo UI with ID: ${uiId}`);

      this.logger.log(`✅ Successfully created demo content for organization ${orgId}:`);
      this.logger.log(`  - Project: "${demoProject.project.name}" (ID: ${projectId})`);
      this.logger.log(`  - Design System with documentation and brand colors`);
      this.logger.log(`  - UI: "Demo Dashboard" (ID: ${uiId})`);

    } catch (error) {
      this.logger.error(`Failed to create demo content for organization ${orgData.id}:`, error);
      // Don't throw error - webhook should succeed even if demo creation fails
    }
  }

  async handleOrganizationUpdated(orgData: any) {
    this.logger.log(`Organization updated: ${orgData.id}`);
    // Implement organization update logic if needed
  }

  async handleOrganizationDeleted(orgData: any) {
    this.logger.log(`Organization deleted: ${orgData.id}`);
    // Implement cleanup logic if needed
    // Note: Projects are soft-deleted, so they might remain in the database
  }
}