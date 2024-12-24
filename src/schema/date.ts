import { GraphQLScalarType, Kind } from "graphql";
import { z } from "zod";

// Define the Date scalar
export const DateScalar = new GraphQLScalarType({
  name: "Date",
  description: "A custom scalar to handle Date values",
  serialize(value) {
    const date = z.date().parse(value);

    return date.toISOString(); // Convert outgoing Date to ISO string
  },
  parseValue(value) {
    return z.date().parse(value); // Convert incoming ISO string to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Convert hard-coded AST string to Date
    }
    return null; // Invalid hard-coded value (not a string)
  },
});
