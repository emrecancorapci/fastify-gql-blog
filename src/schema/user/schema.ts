export const userSchema = `#graphql
type User {
  id: ID!,
  username: String!,
  email: String!,
  password_hash: String!,
  bio: String,
  posts: [Post!]!,
  comments: [Comment!],
  likes: [Post!]!,
  profile_img: String!,
  created_at: String!,
  updated_at: String!,
}`;
