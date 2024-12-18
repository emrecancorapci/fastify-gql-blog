export const postSchema = `#graphql
type Post {
  id: ID!,
  title: String!,
  img_url: String,
  slug: String!,
  content: String!,
  author: User!,
  category: Category!,
  tags: [Tag!]!,
  likes: [User!],
  comments: [Comment!],
  created_at: String!,
  updated_at: String!,
  published: Boolean!,
}`;
