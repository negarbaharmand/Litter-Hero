CREATE TYPE "public"."status" AS ENUM('pending', 'verified', 'disputed', 'cleaned', 'rejected');--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "status" "status" DEFAULT 'pending' NOT NULL;