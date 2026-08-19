require("dotenv").config();

const connectToDatabase = require("./db");
const createApolloServer = require("./server");

const startServer = async () => {
  await connectToDatabase();
  await createApolloServer();
};

startServer();
