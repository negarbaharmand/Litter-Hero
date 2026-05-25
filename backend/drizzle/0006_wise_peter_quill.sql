DO $$ BEGIN
  CREATE TYPE "public"."cleanup_submission_status" AS ENUM('pending', 'approved', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."cleanup_vote" AS ENUM('clean', 'not_clean');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
ALTER TYPE "public"."status" ADD VALUE IF NOT EXISTS 'open';
--> statement-breakpoint
ALTER TYPE "public"."status" ADD VALUE IF NOT EXISTS 'cleanup_pending_vote';
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cleanup_submissions" (
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
CREATE TABLE IF NOT EXISTS "cleanup_submission_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"vote" "cleanup_vote" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "cleaned_by_user_id" integer;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "cleaned_at" timestamp;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cleanup_submission_votes" ADD CONSTRAINT "cleanup_submission_votes_submission_id_cleanup_submissions_id_fk"
    FOREIGN KEY ("submission_id") REFERENCES "public"."cleanup_submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cleanup_submission_votes" ADD CONSTRAINT "cleanup_submission_votes_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cleanup_submissions" ADD CONSTRAINT "cleanup_submissions_report_id_reports_id_fk"
    FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cleanup_submissions" ADD CONSTRAINT "cleanup_submissions_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cleanup_submission_votes_submission_user_idx"
  ON "cleanup_submission_votes" USING btree ("submission_id", "user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cleanup_submissions_report_user_idx"
  ON "cleanup_submissions" USING btree ("report_id", "user_id");
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reports" ADD CONSTRAINT "reports_cleaned_by_user_id_users_id_fk"
    FOREIGN KEY ("cleaned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
