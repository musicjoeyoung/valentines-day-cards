ALTER TABLE "public"."cards" ALTER COLUMN "message_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."message_type";--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('custom', 'improved', 'sweet', 'funny', 'limerick', 'flavorflav', 'rupaul', 'deGrasseTyson', 'goose');--> statement-breakpoint
ALTER TABLE "public"."cards" ALTER COLUMN "message_type" SET DATA TYPE "public"."message_type" USING "message_type"::"public"."message_type";