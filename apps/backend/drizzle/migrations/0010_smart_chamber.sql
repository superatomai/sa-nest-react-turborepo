CREATE TABLE "project_source_code" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"source_code" text,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	CONSTRAINT "project_source_code_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "project_source_code" ADD CONSTRAINT "project_source_code_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;