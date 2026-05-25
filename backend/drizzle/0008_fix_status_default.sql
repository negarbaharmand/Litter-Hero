ALTER TABLE "reports" ALTER COLUMN "status" SET DEFAULT 'open';--> statement-breakpoint
UPDATE "reports" SET "status" = 'open' WHERE "status" = 'pending';