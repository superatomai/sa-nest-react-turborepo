CREATE TABLE "project_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"key_value" text NOT NULL,
	"environment" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"custom_inst" text,
	"created_by" varchar,
	"updated_by" varchar,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "project_keys" ADD CONSTRAINT "project_keys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;