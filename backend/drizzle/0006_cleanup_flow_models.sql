ALTER TYPE "status" ADD VALUE IF NOT EXISTS 'open';--> statement-breakpoint
ALTER TYPE "status" ADD VALUE IF NOT EXISTS 'cleanup_pending_vote';--> statement-breakpoint
CREATE TYPE "public"."cleanup_submission_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."cleanup_vote" AS ENUM('clean', 'not_clean');--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "cleaned_by_user_id" integer;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "cleaned_at" timestamp;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
UPDATE "reports" SET "status" = 'open' WHERE "status" = 'pending';--> statement-breakpoint
CREATE TABLE "cleanup_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"note" varchar(1000),
	"status" "cleanup_submission_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cleanup_submission_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"vote" "cleanup_vote" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_cleaned_by_user_id_users_id_fk" FOREIGN KEY ("cleaned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanup_submissions" ADD CONSTRAINT "cleanup_submissions_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanup_submissions" ADD CONSTRAINT "cleanup_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanup_submission_votes" ADD CONSTRAINT "cleanup_submission_votes_submission_id_cleanup_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."cleanup_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleanup_submission_votes" ADD CONSTRAINT "cleanup_submission_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cleanup_submissions_report_user_idx" ON "cleanup_submissions" USING btree ("report_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cleanup_submission_votes_submission_user_idx" ON "cleanup_submission_votes" USING btree ("submission_id","user_id");
