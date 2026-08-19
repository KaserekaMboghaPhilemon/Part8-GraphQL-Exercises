import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import LoginForm from "./components/LoginForm";
import NewBook from "./components/NewBook";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(
    localStorage.getItem("library-user-token"),
  );
  const client = useApolloClient();

  const logout = () => {
    localStorage.removeItem("library-user-token");
    setToken(null);
    client.resetStore();
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {!token ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <button onClick={logout}>logout</button>
        )}
      </div>

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      {token && <NewBook show={page === "add"} />}

      {!token && <LoginForm show={page === "login"} setToken={setToken} />}
    </div>
  );
};

export default App;
