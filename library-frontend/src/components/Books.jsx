import { useState } from "react";
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState("all genres");
  const result = useQuery(ALL_BOOKS);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = result.data?.allBooks ?? [];

  // Extract all unique genres from the fetched books
  const genres = Array.from(new Set(books.flatMap((b) => b.genres || [])));

  // Filter books based on selected state
  const booksToShow =
    selectedGenre === "all genres"
      ? books
      : books.filter((b) => b.genres.includes(selectedGenre));

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
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
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
