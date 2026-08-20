import { useQuery } from '@apollo/client'
import { ME, ALL_BOOKS } from '../queries'
const Recommend = (props) => {
  const meResult = useQuery(ME)

  const favoriteGenre = meResult.data?.me?.favoriteGenre

  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre,
  })

  if (!props.show) {
    return null;
  }
 
  if (meResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }
  const books = booksResult.data?.allBooks ?? []

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend