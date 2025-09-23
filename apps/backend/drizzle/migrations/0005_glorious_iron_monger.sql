CREATE TABLE "design_system" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"colors" jsonb,
	"typography" jsonb,
	"spacing" jsonb,
	"borders" jsonb,
	"shadows" jsonb,
	"buttons" jsonb,
	"images" jsonb,
	"misc" jsonb,
	"design_notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "design_system" ADD CONSTRAINT "design_system_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "design_notes";