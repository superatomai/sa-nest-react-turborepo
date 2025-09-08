import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UisService } from '../uis/uis.service';
import { VersionsService } from '../uis/versions.service';
import type { User } from '@clerk/backend';

export interface UploadNewUIVersionRequest {
  input: string;
  dsl: any;
  uiId: string;
}

export interface UpdateUIWithNewVersionRequest {
  uiId: string;
  versionId: number;
  projectId: string;
}

export interface FetchDSLRequest {
  projectId: string;
  uiId: string;
}

@Injectable()
export class UiUtilsService {
  constructor(
    private readonly uisService: UisService,
    private readonly versionsService: VersionsService,
  ) {}

  /**
   * Upload new UI version (equivalent to upload_new_ui_version)
   * Creates a new version in the versions table
   */
  async uploadNewUIVersion(
    request: UploadNewUIVersionRequest,
    user?: User
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const { input, dsl, uiId } = request;

      if (!input?.trim()) {
        throw new BadRequestException('Prompt input is required');
      }

      if (!uiId?.trim()) {
        throw new BadRequestException('UI ID is required');
      }

      if (!dsl) {
        throw new BadRequestException('DSL is required');
      }

      console.log('Creating new version for UI:', uiId);

      // Create new version using VersionsService
      const version = await this.versionsService.createVersion(
        {
          prompt: input.trim(),
          uiId: uiId,
          dsl: typeof dsl === 'object' ? JSON.stringify(dsl) : dsl,
        },
        user
      );

      console.log('A new version created:', version);

      if (!version?.version?.id) {
        console.error('Version ID not returned');
        return {
          success: false,
          message: 'Version ID not returned'
        };
      }

      return {
        success: true,
        data: version.version
      };

    } catch (error) {
      console.error('Error uploading new UI version:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload new UI version'
      };
    }
  }

  /**
   * Update UI with new version (equivalent to update_ui_with_new_version)
   * Updates the UI table to reference the new version
   */
  async updateUIWithNewVersion(
    request: UpdateUIWithNewVersionRequest,
    user?: User
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> {
    try {
      const { uiId, versionId, projectId } = request;

      if (!uiId?.trim()) {
        throw new BadRequestException('UI ID is required');
      }

      if (!versionId) {
        throw new BadRequestException('Version ID is required');
      }

      if (!projectId?.trim()) {
        throw new BadRequestException('Project ID is required');
      }

      // Get the UI by uiId and projectId
      const uiRes = await this.uisService.getAllUis({
        projectId: parseInt(projectId),
        where: { uiId: uiId },
        limit: 1,
      }, user);

      if (!uiRes?.uis || uiRes.uis.length === 0) {
        console.error('❌ UI not found');
        return {
          success: false,
          message: 'UI not found'
        };
      }

      const uiRow = uiRes.uis[0];

      // Update UI with new version ID
      const updateRes = await this.uisService.updateUi(
        uiRow.id,
        { uiVersion: versionId },
        user
      );

      return {
        success: true,
        data: updateRes
      };

    } catch (error) {
      console.error('Error updating UI with new version:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update UI with new version'
      };
    }
  }

  /**
   * Fetch DSL (equivalent to fetchDSL)
   * Gets DSL from version table based on UI's current version
   */
  async fetchDSL(
    request: FetchDSLRequest,
    user?: User
  ): Promise<{
    success: boolean;
    data?: string;
    message?: string;
  }> {
    try {
      const { projectId, uiId } = request;

      if (!projectId?.trim()) {
        throw new BadRequestException('Project ID is required');
      }

      if (!uiId?.trim()) {
        throw new BadRequestException('UI ID is required');
      }

      // 1️⃣ Get UI row
      const uiRes = await this.uisService.getAllUis({
        projectId: parseInt(projectId),
        where: { uiId: uiId },
        limit: 1,
      }, user);

      if (!uiRes?.uis || uiRes.uis.length === 0) {
        return {
          success: false,
          message: 'UI not found'
        };
      }

      const uiRow = uiRes.uis[0];

      if (!uiRow.uiVersion) {
        return {
          success: false,
          message: 'UI version not found'
        };
      }

      // 2️⃣ Get version row using ui_version ID
      const versionRes = await this.versionsService.getVersionById(uiRow.uiVersion, user);

      if (!versionRes?.version) {
        return {
          success: false,
          message: 'Version not found'
        };
      }

      return {
        success: true,
        data: versionRes.version.dsl
      };

    } catch (error) {
      console.error('Error fetching DSL:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch DSL'
      };
    }
  }

  /**
   * Combined operation: Upload version and update UI in one call
   */
  async uploadAndUpdateUI(
    request: {
      input: string;
      dsl: any;
      uiId: string;
      projectId: string;
    },
    user?: User
  ): Promise<{
    success: boolean;
    data?: {
      version: any;
      ui: any;
    };
    message?: string;
  }> {
    try {
      // Step 1: Upload new version
      const uploadResult = await this.uploadNewUIVersion({
        input: request.input,
        dsl: request.dsl,
        uiId: request.uiId,
      }, user);

      if (!uploadResult.success || !uploadResult.data?.id) {
        return {
          success: false,
          message: uploadResult.message || 'Failed to upload version'
        };
      }

      // Step 2: Update UI with new version
      const updateResult = await this.updateUIWithNewVersion({
        uiId: request.uiId,
        versionId: uploadResult.data.id,
        projectId: request.projectId,
      }, user);

      if (!updateResult.success) {
        return {
          success: false,
          message: updateResult.message || 'Failed to update UI'
        };
      }

      return {
        success: true,
        data: {
          version: uploadResult.data,
          ui: updateResult.data
        }
      };

    } catch (error) {
      console.error('Error in upload and update UI:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload and update UI'
      };
    }
  }

  /**
   * Get UI with all versions
   */
  async getUIWithVersions(
    request: { projectId: string; uiId: string },
    user?: User
  ): Promise<{
    success: boolean;
    data?: {
      ui: any;
      versions: any[];
      currentVersion?: any;
    };
    message?: string;
  }> {
    try {
      const { projectId, uiId } = request;

      // Get UI
      const uiRes = await this.uisService.getAllUis({
        projectId: parseInt(projectId),
        where: { uiId: uiId },
        limit: 1,
      }, user);

      if (!uiRes?.uis || uiRes.uis.length === 0) {
        return {
          success: false,
          message: 'UI not found'
        };
      }

      const ui = uiRes.uis[0];

      // Get all versions for this UI
      const versionsRes = await this.versionsService.getAllVersions({
        uiId: uiId,
        orderBy: { versionId: 'desc' }
      }, user);

      // Get current version if exists
      let currentVersion = null;
      if (ui.uiVersion) {
        const currentVersionRes = await this.versionsService.getVersionById(ui.uiVersion, user);
        currentVersion = currentVersionRes.version;
      }

      return {
        success: true,
        data: {
          ui: ui,
          versions: versionsRes.versions || [],
          currentVersion: currentVersion
        }
      };

    } catch (error) {
      console.error('Error getting UI with versions:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get UI with versions'
      };
    }
  }
}