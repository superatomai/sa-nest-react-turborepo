-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "Page" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
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
	"created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
	"deleted" boolean DEFAULT false NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"created_by" varchar,
	"updated_by" varchar
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
ALTER TABLE "uis" ADD CONSTRAINT "uis_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;
*/