ALTER TABLE "blog"."comments" ALTER COLUMN "deleted" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blog"."posts" ALTER COLUMN "published" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blog"."posts" ALTER COLUMN "deleted" SET NOT NULL;