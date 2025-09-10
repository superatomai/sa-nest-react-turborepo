import { User } from '@clerk/backend';
import { BadRequestException, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DrizzleService } from 'drizzle/drizzle.service';
import { projects, uiList } from 'drizzle/schema';

interface UiListData {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  createdBy?: string;
  updatedBy?: string;
  uiList: any;
}

@Injectable()
export class UiListService {
  constructor(private readonly drizzleService: DrizzleService) {}

  // Get a UiList by ID
  async getUiList(id: number, user?: User) {
    if (!id) throw new BadRequestException('UI List ID is required');

    try {
      console.log('Fetching UI list for id ' + id + ' at ' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .select({ ...uiList })
        .from(uiList)
        .where(eq(uiList.id, id));

      console.log('UI list fetched at ' + new Date().toLocaleString());

      return {
        message: `UI List for id ${id}`,
        userId: user?.id || 'anonymous',
        uiList: result,
      };
    } catch (error) {
      console.error('Error fetching UI list:', error);
      return error;
    }
  }

  // Create a new UI list and link it to a project
  async createUiList(data: UiListData, projId: number, user?: User) {
    if (!data.uiList || data.uiList.length === 0)
      throw new BadRequestException('UI List content is required');
    if (!projId) throw new BadRequestException('Project ID is required');

    try {
      console.log('Creating UI list at ' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .insert(uiList)
        .values({
          uiList: data.uiList,
          version: 1,
        })
        .returning();

      // Update project with the new uiList id
      await this.drizzleService.db
        .update(projects)
        .set({
          uiList: result[0].id,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, projId));

      console.log('UI list created and project updated at ' + new Date().toLocaleString());

      return {
        success: true,
        message: 'UI List created successfully',
        userId: user?.id || 'anonymous',
        uiList: result,
      };
    } catch (error) {
      console.error('Error creating UI list:', error);
      return error;
    }
  }

  // Update an existing UI list
  async updateUiList(data: UiListData, user?: User) {
    if (!data.id) throw new BadRequestException('UI List ID is required');
    if (!data.uiList || data.uiList.length === 0)
      throw new BadRequestException('UI List content is required');

    try {
      console.log('Updating UI list at ' + new Date().toLocaleString());

      const result = await this.drizzleService.db
        .update(uiList)
        .set({
          uiList: data.uiList,
          updatedAt: new Date().toISOString(),
          version: sql`${uiList.version} + 1`,
        })
        .where(eq(uiList.id, data.id))
        .returning();

      console.log('UI list updated at ' + new Date().toLocaleString());

      return {
        success: true,
        message: 'UI List updated successfully',
        userId: user?.id || 'anonymous',
        uiList: result[0], // single updated row
      };
    } catch (error) {
      console.error('Error updating UI list:', error);
      return error;
    }
  }
}
