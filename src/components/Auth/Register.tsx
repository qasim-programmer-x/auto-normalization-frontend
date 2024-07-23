import { useState } from "react";
import "./Auth.scss";
import axios from "axios";
import { url } from "../../url";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const registerSubmit = async (e: any) => {
    if (loading) return;
    setLoading(true);
    e.preventDefault();

    try {
      const response = await axios.post(`${url}/user/`, {
        username,
        password,
      });
      console.log(response.data);

      alert("Registered succesfully. Please login now");
      window.location.href = "login";
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      alert(e.response.data.message);
      console.error("There was an error creating the account!", e);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={registerSubmit}>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>
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
            {loading ? <div className="loading-indicator"></div> : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
