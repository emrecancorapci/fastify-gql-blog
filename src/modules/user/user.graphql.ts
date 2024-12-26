export const userSchema = `#graphql
type User {
  id: ID!,
  username: String!,
  email: String!,
  name: String,
  bio: String,
  profile_img: String!,
  posts: [Post!],
  comments: [Comment!],
  post_likes: [Post!],
  comment_likes: [Comment!],
  editor_on: [Category!],
  created_at: DateTime!,
  updated_at: DateTime!,
}`;
