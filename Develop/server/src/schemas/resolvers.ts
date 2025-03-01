import { AuthenticationError } from "apollo-server-express";
import { User } from "../models";
import { signToken } from "../utils./auth";

//Define resolvers for GraphQL operations
const resolvers = {
  //Query resolvers
  Query: {
    //Get logged in user's data
    me: (parent, args, context) => {
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
    login: (parent, { email, password }) => {
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
          const token = signToken(user);
          return { token, user };
        });
      });
    },

    //Create a new user account
    addUser: (parent, { username, email, password }) => {
      return User.create({ username, email, password }).then((user) => {
        const token = signToken(user);
        return { token, user };
      });
    },

    //Save a new book to user's account
    saveBook: (parent, { bookData }, context) => {
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
    removeBook: (parent, { bookId }, context) => {
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
