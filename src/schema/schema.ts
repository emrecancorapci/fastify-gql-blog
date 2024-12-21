import { postSchema } from "./post/schema.js";
import { userSchema } from "./user/schema.js";

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

type Mutation {
  createPost(title: String!, img_url: String, content: String!, author_id: ID!, category_id: ID!, tags: [ID!]!, published: Boolean): Post,
  updatePost(id: ID!, title: String, img_url: String, content: String, author_id: ID, category_id: ID, tags: [ID], published: Boolean): Post,
  deletePost(id: ID!): Post,

  createUser(username: String!, email: String!, password: String!): User,
  updateUser(id: ID!, username: String, email: String, password: String, bio: String, profile_img: String): User,
  deleteUser(id: ID!): User,
  login(email: String!, password: String!): User,

  createComment(author_id: ID!, post_id: ID!, content: String!): Comment,
  updateComment(id: ID!, author_id: ID, post_id: ID, content: String): Comment,
  deleteComment(id: ID!): Comment,

  createCategory(name: String!, slug: String!): Category,
  updateCategory(id: ID!, name: String, slug: String): Category,
  deleteCategory(id: ID!): Category,
}
`;
