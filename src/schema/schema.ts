import { postSchema } from "../modules/post/post.graphql.js";
import { userSchema } from "../modules/user/user.graphql.js";

export default `#graphql
scalar DateTime

${postSchema}
${userSchema}

type Comment {
  id: ID!,
  content: String!,
  author: User!,
  post: Post!,
  likes: [User!],
  created_at: DateTime!,
  updated_at: DateTime!,
  is_deleted: Boolean!,
  deleted_at: DateTime,
  deleted_by: User,
}

type Category {
  id: Number!,
  name: String!,
  slug: String!,
  posts: [Post!],
  editors: [User!],
  created_at: DateTime!,
  updated_at: DateTime!,
}

type Tag {
  id: Number!,
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
  category(id: Number, slug: String): Category,
  tags: [Tag],
  tag(id: Number, slug: String): Tag,
}

type Mutation {
  createPost(title: String!, img_url: String, content: String!, author_id: ID!, category_id: ID!, tags: [ID!], published: Boolean): Post,
  updatePost(id: ID!, title: String, img_url: String, content: String, author_id: ID, category_id: ID, tags: [ID!], published: Boolean): Post,
  deletePost(id: ID!): Post,

  createUser(username: String!, email: String!, password: String!): User,
  updateUser(id: ID!, username: String, email: String, password: String, bio: String, profile_img: String): User,
  deleteUser(id: ID!): User,

  login(email: String!, password: String!): String,
  register(username: String!, email: String!, password: String!): String,

  createComment(author_id: ID!, post_id: ID!, content: String!): Comment,
  updateComment(id: ID!, author_id: ID, post_id: ID, content: String): Comment,
  deleteComment(id: ID!): Comment,

  createTag(name: String!, slug: String!): Tag,
  updateTag(id: Number!, name: String, slug: String): Tag,
  deleteTag(id: Number!): Tag,

  createCategory(name: String!, slug: String!): Category,
  updateCategory(id: Number!, name: String, slug: String): Category,
  deleteCategory(id: Number!): Category,
}
`;
