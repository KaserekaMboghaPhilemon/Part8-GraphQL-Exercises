const Book = require("./models/book");
const Author = require("./models/author");

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),

    allBooks: async (root, args) => {
      const filter = {};

      // Filter by genre using MongoDB's $in operator
      if (args.genre) {
        filter.genres = { $in: [args.genre] };
      }

      // Filter by author name if provided
      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (!author) {
          return [];
        }
        filter.author = author._id;
      }

      return Book.find(filter).populate("author");
    },

    allAuthors: async () => {
      return Author.find({});
    },
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      const book = new Book({ ...args, author: author._id });
      await book.save();

      return book.populate("author");
    },

    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;
      return author.save();
    },
  },
};

module.exports = resolvers;
