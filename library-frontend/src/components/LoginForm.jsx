import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { LOGIN } from "../queries";

const LoginForm = ({ show, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const client = useApolloClient();
  const [login, result] = useMutation(LOGIN, {
    onCompleted: ({ login }) => {
      const token = login.value;
      localStorage.setItem("library-user-token", token);
      setToken(token);
      client.resetStore();
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    await login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>log in</h2>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
      {result.error && (
        <div style={{ color: "red" }}>{result.error.message}</div>
      )}
    </div>
  );
};

export default LoginForm;
