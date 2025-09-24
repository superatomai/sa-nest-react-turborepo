ALTER TABLE "docs" RENAME COLUMN "docs" TO "api_docs";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_docs_fkey";
--> statement-breakpoint
ALTER TABLE "docs" ADD COLUMN "project_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "docs";--> statement-breakpoint
ALTER TABLE "docs" ADD CONSTRAINT "docs_project_id_unique" UNIQUE("project_id");