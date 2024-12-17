export default `#graphql

type Post {
  id: ID!,
  title: String!,
  img_url: String!,
  slug: String!,
  content: String!,
  author: User!,
  category: Category!,
  tags: [Tag!]!,
  likes: [User!]!,
  created_at: String!,
  updated_at: String!,
  published: Boolean!,
}

type User {
  id: ID!,
  username: String!,
  email: String!,
  password_hash: String!,
  bio: String,
  posts: [Post!]!,
  comments: [Comment!]!,
  likes: [Post!]!,
  profile_img: String!,
  created_at: String!,
}

type Comment {
  id: ID!,
  author: User!,
  post: Post!,
  content: String!,
  created_at: String!,
}

type Category {
  id: ID!,
  name: String!,
  slug: String!,
  posts: [Post!]!,
}

type Tag {
  id: ID!,
  name: String!,
  slug: String!,
  posts: [Post!]!,
}

type Query {
  posts: [Post],
  post(id: ID!): Post,
  users: [User],
  user(id: ID!): User,
  categories: [Category],
  category(id: ID!): Category,
  tags: [Tag],
  tag(id: ID!): Tag,
}
`;
