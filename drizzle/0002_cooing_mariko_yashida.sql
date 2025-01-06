CREATE TYPE "public"."message_type" AS ENUM('custom', 'improved', 'sweet', 'funny');--> statement-breakpoint
ALTER TABLE "cards" ADD COLUMN "message_type" "message_type" DEFAULT 'custom' NOT NULL;