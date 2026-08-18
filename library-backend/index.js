const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v4: uuidv4 } = require("uuid");

let authors = [
  {
    name: "Robert Martin",
    id: "ffa51a00-21a7-11e8-85e0-e19f34ba3a11",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "ffa51a01-21a7-11e8-85e0-e19f34ba3a11",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "ffa51a02-21a7-11e8-85e0-e19f34ba3a11",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky",
    id: "ffa51a03-21a7-11e8-85e0-e19f34ba3a11",
  },
  {
    name: "Sandi Metz",
    id: "ffa51a04-21a7-11e8-85e0-e19f34ba3a11",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "ffa51a05-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "ffa51a06-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "ffa51a07-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2004,
    author: "Joshua Kerievsky",
    id: "ffa51a08-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "ffa51a09-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and Punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "ffa51a0a-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "ffa51a0b-21a7-11e8-85e0-e19f34ba3a11",
    genres: ["classic", "revolution"],
  },
];

const typeDefs = `
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let filteredBooks = books;
      if (args.author) {
        filteredBooks = filteredBooks.filter((b) => b.author === args.author);
      }
      if (args.genre) {
        filteredBooks = filteredBooks.filter((b) =>
          b.genres.includes(args.genre),
        );
      }
      return filteredBooks;
    },
    allAuthors: () => authors,
  },
  Author: {
    bookCount: (root) => books.filter((b) => b.author === root.name).length,
  },
  Mutation: {
    addBook: (root, args) => {
      const authorExists = authors.find((a) => a.name === args.author);
      if (!authorExists) {
        const newAuthor = {
          name: args.author,
          id: uuidv4(),
          born: null,
        };
        authors = authors.concat(newAuthor);
      }

      const book = { ...args, id: uuidv4() };
      books = books.concat(book);
      return book;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
