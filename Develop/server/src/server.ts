// Import dependencies
import express from "express";
import path from "node:path";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import db from "./config/connection.js";
import { typeDefs, resolvers } from "./schemas/index.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Create a new express server and define port
const PORT = process.env.PORT || 3001;
const app = express();

//Create new Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

//Start Apollo server and apply middleware
const startApolloServer = () => {
  server.start().then(() => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    //Apply Apollo Server middleware with authentication
    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: async ({ req }) => ({
          user: req.user,
        }),
      })
    );

    //Serve up static assets in production
    if (process.env.NODE_ENV === "production") {
      app.use(
        express.static(path.join(__dirname, "../../../../Develop/client/dist"))
      );
      app.get("*", (_req, res) => {
        res.sendFile(
          path.join(__dirname, "../../../../Develop/client/dist/index.html")
        );
      });
    }

    //Start server on port 3001
    db.once("open", () => {
      app.listen(PORT, () => {
        console.log(`🌍 Now listening on localhost:${PORT}`);
        console.log(`🚀Use GraphQL at http://localhost:${PORT}/graphql`);
      });
    });
  });
};

startApolloServer();
