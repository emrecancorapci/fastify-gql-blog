ALTER TABLE "blog"."users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "blog"."categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");