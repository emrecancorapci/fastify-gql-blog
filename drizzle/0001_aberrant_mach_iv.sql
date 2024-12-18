ALTER TABLE "blog"."comments" DROP CONSTRAINT "comments_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "blog"."likes" DROP CONSTRAINT "likes_post_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "blog"."posts_to_tags" DROP CONSTRAINT "posts_to_tags_post_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "blog"."comments" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "blog"."posts" ADD COLUMN "author_id" uuid;--> statement-breakpoint
ALTER TABLE "blog"."users" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "blog"."comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "blog"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog"."posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "blog"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog"."posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "blog"."categories"("id") ON DELETE set null ON UPDATE no action;