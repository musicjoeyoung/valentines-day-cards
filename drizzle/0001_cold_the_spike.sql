CREATE TABLE IF NOT EXISTS "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"to" text,
	"from" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "users" CASCADE;