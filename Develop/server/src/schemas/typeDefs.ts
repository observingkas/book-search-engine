//User type defines the structure for user data
//Import the qql template literal tag from Apollo Server
import { gql } from "apollo-server-express";

//Define GraphQL schema using gql
const typeDefs = gql`
# User type defines the fields for user data
type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks: [Book]
}
    
//Book type defines the structure for book data
type Book {
    bookId: String!
    authors: [String]
    description: String!
    title: String!
    link: String
}

//Auth type returns after successful login/signup

type Auth {
    token: ID!
    user: User
}

//Query type defines the available queries, returns the currently logged-in user

type Query {
    me: User 
}

//Book input type for saving new books

input BookInput {
    bookId: String!
    authors: [String]
    description: String!
    title: String!
    image: String
    link: String
}

//Mutation type defines the available mutations

type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
}

`;

export default typeDefs;
