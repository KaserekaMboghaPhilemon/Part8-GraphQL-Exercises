const { ApolloServer } = require("@apollo/server");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@as-integrations/express5");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
  return User.findById(decodedToken.id);
};

const startServer = async (port = 4000) => {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Set up WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async ({ connectionParams }) => ({
        currentUser: await getUserFromAuthHeader(
          connectionParams?.authorization,
        ),
      }),
    },
    wsServer,
  );

  // Set up Apollo Server with HTTP & WS cleanup plugins
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        return { currentUser: await getUserFromAuthHeader(auth) };
      },
    }),
  );

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}/`);
  });
};

module.exports = startServer;
