CREATE TABLE "docs" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"updated_by" varchar,
	"docs" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Page" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted" boolean DEFAULT false NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar,
	"updated_by" varchar,
	"docs" integer,
	"ui_list" integer
);
--> statement-breakpoint
CREATE TABLE "ui_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"updated_by" varchar,
	"ui_list" jsonb NOT NULL,
	"version" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uis" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"published" boolean DEFAULT false NOT NULL,
	"ui_id" varchar NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"updated_by" varchar,
	"ui_version" integer NOT NULL,
	"description" text,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"dsl" text NOT NULL,
	"prompt" text NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_by" varchar,
	"updated_by" varchar,
	"ui_id" varchar NOT NULL,
	"version_id" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_docs_fkey" FOREIGN KEY ("docs") REFERENCES "public"."docs"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_ui_list_fkey" FOREIGN KEY ("ui_list") REFERENCES "public"."ui_list"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "uis" ADD CONSTRAINT "uis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;