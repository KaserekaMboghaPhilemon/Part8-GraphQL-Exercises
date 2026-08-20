import { useState, useEffect } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState("all genres");

  // Initial query to fetch all books and compute unique genres list
  const allBooksResult = useQuery(ALL_BOOKS);

  // Lazy query to fetch filtered books from backend when genre button is clicked
  const [getFilteredBooks, filteredBooksResult] = useLazyQuery(ALL_BOOKS);

  useEffect(() => {
    if (selectedGenre === "all genres") {
      getFilteredBooks({ variables: { genre: null } });
    } else {
      getFilteredBooks({ variables: { genre: selectedGenre } });
    }
  }, [selectedGenre, getFilteredBooks]);

  if (!props.show) {
    return null;
  }

  if (allBooksResult.loading || filteredBooksResult.loading) {
    return <div>loading...</div>;
  }

  const allBooks = allBooksResult.data?.allBooks ?? [];

  // Display books returned by the filtered GraphQL query
  const booksToShow = filteredBooksResult.data?.allBooks ?? allBooks;

  // Extract all unique genres from all books in the database
  const genres = Array.from(new Set(allBooks.flatMap((b) => b.genres || [])));

  return (
    <div>
      <h2>books</h2>

      <p>
        in genre <strong>{selectedGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((b) => (
            <tr key={b.title}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setSelectedGenre("all genres")}>
          all genres
        </button>
      </div>
    </div>
  );
};

export default Books;
