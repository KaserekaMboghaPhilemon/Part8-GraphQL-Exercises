const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const pubsub = new PubSub();

const resolvers = {
  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },

  Query: {
    bookCount: async () => Book.countDocuments(),
    authorCount: async () => Author.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {};

      if (args.genre) filter.genres = { $in: [args.genre] };

      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (!author) return [];
        filter.author = author._id;
      }

      return Book.find(filter).populate("author");
    },
    allAuthors: async () => {
      const authors = await Author.find({}).lean();
      const books = await Book.find({}, { author: 1 }).lean();
      const bookCounts = books.reduce((counts, book) => {
        const authorId = String(book.author);
        counts[authorId] = (counts[authorId] || 0) + 1;
        return counts;
      }, {});

      return authors.map((author) => ({
        ...author,
        id: String(author._id),
        bookCount: bookCounts[String(author._id)] || 0,
      }));
    },
    me: (root, args, context) => context.currentUser,
  },

  Mutation: {
    addBook: async (root, args, context) => {
      // 1. Check authentication context if required
      if (!context.currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // 2. Resolve or create Author document
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      // 3. Create book with author object ID
      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError(`Saving book failed: ${error.message}`, {
          extensions: { code: "BAD_USER_INPUT", error },
        });
      }

      // 4. Populate author field and publish subscription event
      const populatedBook = await book.populate("author");

        await pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });

      return populatedBook;
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const author = await Author.findOne({ name: args.name });
      if (!author) return null;
      author.born = args.setBornTo;
      return author.save();
    },

    createUser: async (root, args) =>
      new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      }).save(),

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      return {
        value: jwt.sign(
          { username: user.username, id: user._id },
          process.env.JWT_SECRET,
        ),
      };
    },

    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("Reset database is only available in test mode");
      }

      await Promise.all([
        Author.deleteMany({}),
        Book.deleteMany({}),
        User.deleteMany({}),
      ]);
      return true;
    },
  },

  Subscription: {
    bookAdded: {
      // Fixed: asyncIterator instead of asyncIterableIterator
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
