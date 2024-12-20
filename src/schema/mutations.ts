export const mutations = `#graphql
type Mutation {
  createPost(title: String!, img_url: String, content: String!, author_id: ID!, category_id: ID!, tags: [ID!]!, published: Boolean): Post,
  updatePost(id: ID!, title: String, img_url: String, content: String, author_id: ID, category_id: ID, tags: [ID], published: Boolean): Post,
  deletePost(id: ID!): Post,
  createUser(username: String!, email: String!, password: String!, bio: String, profile_img: String): User,
  updateUser(id: ID!, username: String, email: String, password: String, bio: String, profile_img: String): User,
  deleteUser(id: ID!): User,
  createComment(author_id: ID!, post_id: ID!, content: String!): Comment,
  updateComment(id: ID!, author_id: ID, post_id: ID, content: String): Comment,
  deleteComment(id: ID!): Comment,
  createCategory(name: String!, slug: String!): Category,
  updateCategory(id: ID!, name: String, slug: String): Category,
}`;
