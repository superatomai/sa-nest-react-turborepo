import { Injectable } from "@nestjs/common";
import { DrizzleService } from "drizzle/drizzle.service";
import { projectKeys } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

@Injectable()
export class ProjectKeysService {
    constructor(private readonly drizzleService: DrizzleService) {}
    
  // Service methods would go here
  async getAllProjectKeys(projectId: number) {

    try{

        console.log("fetching all project keys for projectId:", projectId);

        const allProjectKeys = await this.drizzleService.db
        .select()
        .from(projectKeys)
        .where(and(eq(projectKeys.projectId, projectId), eq(projectKeys.deleted, false)))
        .orderBy(desc(projectKeys.updatedAt));

    return {
      message: `Project keys for project ${projectId} retrieved successfully`,
      projectKeys: allProjectKeys,
      total: allProjectKeys.length
    };
       
    }
    catch(error){
        console.error("Error fetching project keys:", error);
        throw error;
    }   
  }


  async createProjectKey(projectId: number, name: string, keyValue: string, environment: string, customInst?: string) {

    try{

        console.log("creating project key for projectId:", projectId);

        const newKey = await this.drizzleService.db
        .insert(projectKeys)
        .values({
            projectId: projectId,
            name: name,
            keyValue: keyValue,
            environment: environment,
            customInst: customInst || "",
            isActive: true,
            deleted: false
        })
        .returning();

        console.log("Successfully created project key:", newKey);
        return {
            message: 'Project key created successfully',
            projectKey: newKey[0],
            keyValue: keyValue // Include the key value for one-time display
        };

    }
    catch(error){
        console.error("Error creating project key:", error);
        throw error;  // IMPORTANT: Throw the error so frontend knows it failed
    }
  }


  async deleteProjectKey(keyId: number) {

    try{
        console.log("deleting project key with id:", keyId);

        const deletekey = await this.drizzleService.db
        .update(projectKeys)
        .set({ deleted: true })
        .where(eq(projectKeys.id, keyId))
        .returning();

        return {
            message: 'Project key deleted successfully',
            deletedKey: deletekey[0]
        };
}
catch(error){
    console.error("Error deleting project key:", error);
    throw error;
}
}

}