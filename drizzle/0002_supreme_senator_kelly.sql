ALTER TABLE "blog"."posts" ALTER COLUMN "published" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "blog"."posts" ADD CONSTRAINT "posts_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "blog"."users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "blog"."users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");