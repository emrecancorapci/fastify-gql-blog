export const postSchema = `#graphql
type Post {
  id: ID!,
  title: String!,
  img_url: String,
  slug: String!,
  content: String!,
  author: User!,
  category: Category!,
  tags: [Tag!],
  post_likes: [User!],
  comments: [Comment!],
  created_at: DateTime!,
  updated_at: DateTime!,
  published: Boolean!,
  deleted: Boolean!,
}`;
