import { postSchema } from "./post/schema.js";
import { userSchema } from "./user/schema.js";
import { mutations } from "./mutations.js";

export default `#graphql

${postSchema}
${userSchema}

type Comment {
  id: ID!,
  author: User!,
  post: Post!,
  content: String!,
  created_at: String!,
  updated_at: String!,
}

type Category {
  id: ID!,
  name: String!,
  slug: String!,
  posts: [Post!],
}

type Tag {
  id: ID!,
  name: String!,
  slug: String!,
  posts: [Post!],
}

type Query {
  posts: [Post],
  post(id: ID, slug: String): Post,
  users: [User],
  user(id: ID, username: String, email: String): User,
  categories: [Category],
  category(id: ID, slug: String): Category,
  tags: [Tag],
  tag(id: ID, slug: String): Tag,
}
${mutations}
`;
