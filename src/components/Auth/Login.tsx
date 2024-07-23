import { useContext, useState } from "react";
import "./Auth.scss";
import axios from "axios";
import { url } from "../../url";
import { AuthContext } from "../../hooks/Context";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("Login must be used within an AuthProvider");
  }
  const { setTokenAndUser } = authContext;

  const loginSubmit = async (e: any) => {
    if (loading) return;
    setLoading(true);
    e.preventDefault();

    try {
      const res = await axios.post(`${url}/auth/login`, {
        username,
        password,
      });
      const { access_token, user } = res.data;
      setTokenAndUser(access_token, user);
      setLoading(false);
      alert("Logged in succesfully");
      window.location.href = "/";
    } catch (e: any) {
      setLoading(false);
      alert(e.response.data.message);
      console.log(e.response);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={loginSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="username"
              id="username"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <button type="submit" className="auth-button">
            {loading ? <div className="loading-indicator"></div> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
