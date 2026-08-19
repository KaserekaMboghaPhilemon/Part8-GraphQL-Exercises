const { expressMiddleware } = require("@apollo/server/express4");
const jwt = require("jsonwebtoken");
const User = require("./models/user");

// Inside your expressMiddleware setup:
app.use(
  "/",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null;
      if (auth && auth.startsWith("Bearer ")) {
        const decodedToken = jwt.verify(
          auth.substring(7),
          process.env.JWT_SECRET,
        );
        const currentUser = await User.findById(decodedToken.id);
        return { currentUser };
      }
    },
  }),
);
