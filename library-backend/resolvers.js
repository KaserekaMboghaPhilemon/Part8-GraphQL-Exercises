const Author = require("./models/author");
const Book = require("./models/book");

const resolvers = {
  Query: {
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async () => {
      return await Book.find({}).populate("author");
    },
    allAuthors: async () => {
      return await Author.find({});
    },
  },

  Author: {
    bookCount: async (root) => {
      return await Book.countDocuments({ author: root._id });
    },
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }

      const book = new Book({
        title: args.title,
        author: author._id,
        published: args.published,
        genres: args.genres,
      });

      await book.save();
      return await Book.findById(book._id).populate("author");
    },

    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }

      author.born = args.setBornTo;
      await author.save();
      return author;
    },
  },
};

module.exports = resolvers;
