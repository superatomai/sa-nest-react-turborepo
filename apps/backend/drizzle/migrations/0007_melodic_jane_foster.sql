CREATE TABLE "ws_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"message" text NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"log" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ws_logs" ADD CONSTRAINT "ws_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE cascade;