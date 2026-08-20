import { ALL_BOOKS } from "../queries";

export const updateCache = (cache, addedBook) => {
  if (!addedBook) return;

  let existing;
  let variables;
  try {
    existing = cache.readQuery({ query: ALL_BOOKS });
    variables = undefined;
  } catch {
    try {
      existing = cache.readQuery({
        query: ALL_BOOKS,
        variables: { genre: null },
      });
      variables = { genre: null };
    } catch {
      existing = null;
      variables = undefined;
    }
  }
  const books = existing?.allBooks ?? [];

  if (books.some((book) => book.id === addedBook.id)) return;

  cache.writeQuery({
    query: ALL_BOOKS,
    ...(variables ? { variables } : {}),
    data: { allBooks: [...books, addedBook] },
  });
};
