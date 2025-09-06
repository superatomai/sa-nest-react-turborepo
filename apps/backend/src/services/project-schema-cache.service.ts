import { Injectable } from '@nestjs/common';
import { WebSocketManagerService } from './websocket-manager.service';

interface ProjectSchema {
    projectId: string;
    data: any; // The docs/schema data
    fetchedAt: number;
}

@Injectable()
export class ProjectSchemaCacheService {
    private cache = new Map<string, ProjectSchema>();

    constructor(
        private readonly webSocketManager: WebSocketManagerService,
    ) {}

    async getProjectSchema(projectId: string): Promise<any> {
        // Check if we have it in cache
        if (this.cache.has(projectId)) {
            const cached = this.cache.get(projectId)!;
            console.log(`Using cached schema for project ${projectId}`);
            return { success: true, data: cached.data };
        }

        try {
            console.log(`Fetching schema for project ${projectId} via WebSocket...`);
            const schemaData = await this.webSocketManager.getDocsForUser(projectId);
            console.log(`schemaData`, schemaData)
            //getting in this format { data: { tables: { ... }, root_fields: { ... } },"projectId": "6","requestId": "r_docs_1","type": "docs" }

            if (!schemaData) {
                console.error(`Failed to fetch schema for project ${projectId}`);
                return { success: false, error: 'Failed to fetch schema' };
            }

            const schema = schemaData.data;

            if (!schema) {
                console.error(`Failed to fetch schema for project ${projectId}`);
                return { success: false, error: 'Failed to fetch schema' };
            }

            // const parsedSchema = z_db_docs_schema.safeParse(schema);
            // if (!parsedSchema.success) {
            //     console.error(`Failed to parse schema for project ${projectId}:`, parsedSchema.error);
            //     return null;
            // }

            // Store in cache
            this.cache.set(projectId, {
                projectId,
                data: schema,
                fetchedAt: Date.now()
            });

            console.log(`Cached schema for project ${projectId}`);

            return { success: true, data: schema };

        } catch (error: any) {
            console.error(`Failed to fetch schema for project ${projectId}:`, error);
            return { success: false, error: 'Failed to fetch schema: ' + error.message };
        }
    }

    // Optional: Clear cache for a project
    clearProject(projectId: string): boolean {
        return this.cache.delete(projectId);
    }

    // Optional: Get cache status
    getCacheStatus(): Array<{ projectId: string; fetchedAt: string; age: number }> {
        const now = Date.now();
        return Array.from(this.cache.entries()).map(([projectId, schema]) => ({
            projectId,
            fetchedAt: new Date(schema.fetchedAt).toISOString(),
            age: now - schema.fetchedAt
        }));
    }
}