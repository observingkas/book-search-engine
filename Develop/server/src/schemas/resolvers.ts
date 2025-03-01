import { AuthenticationError } from "apollo-server-express";
import User from "../models/User";
import { signToken } from "../services/auth";

interface Context {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface BookData {
  bookId: string;
  authors: string[];
  description: string;
  title: string;
  image: string;
  link: string;
}

//Define resolvers for GraphQL operations
const resolvers = {
  //Query resolvers
  Query: {
    //Get logged in user's data
    me: (_parent: unknown, _args: unknown, context: Context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id })
          .select("-password")
          .then((userData) => userData);
      }
      throw new AuthenticationError("You must be logged in");
    },
  },

  //Mutation resolvers
  Mutation: {
    //Handler user login
    login: (
      _parent: unknown,
      { email, password }: { email: string; password: string }
    ) => {
      return User.findOne({ email }).then((user) => {
        if (!user) {
          throw new AuthenticationError(
            "No user found with this email address"
          );
        }
        return user.isCorrectPassword(password).then((correctPw) => {
          if (!correctPw) {
            throw new AuthenticationError("Incorrect credentials");
          }
          const token = signToken(user.username, user.email, user._id);
          return { token, user };
        });
      });
    },

    //Create a new user account
    addUser: (
      _parent: unknown,
      {
        username,
        email,
        password,
      }: { username: string; email: string; password: string }
    ) => {
      return User.create({ username, email, password }).then((user) => {
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      });
    },

    //Save a new book to user's account
    saveBook: (
      _parent: unknown,
      { bookData }: { bookData: BookData },
      context: Context
    ) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        ).then((updatedUser) => updatedUser);
      }
      throw new AuthenticationError("You must be logged in.");
    },

    //Remove a book from user's saved books
    removeBook: (
      _parent: unknown,
      { bookId }: { bookId: string },
      context: Context
    ) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).then((updatedUser) => updatedUser);
      }
      throw new AuthenticationError("You must be logged in.");
    },
  },
};

export default resolvers;
