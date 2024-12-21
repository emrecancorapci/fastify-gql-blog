ALTER TABLE "blog"."comments" ADD COLUMN "deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "blog"."posts" ADD COLUMN "deleted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "blog"."users" ADD COLUMN "name" varchar(127);