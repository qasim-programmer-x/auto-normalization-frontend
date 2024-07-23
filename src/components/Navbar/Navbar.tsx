import { useContext } from "react";
import { AuthContext } from "../../hooks/Context";
import "./Navbar.scss";
export default function Navbar() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("Login must be used within an AuthProvider");
  }

  const { clearAuth } = authContext;

  if (!authContext) {
    throw new Error("LoginRoute must be used within an AuthProvider");
  }

  const { user } = authContext;

  return (
    <nav className="navbar-main">
      {user ? (
        <p className="desk">{user.username}</p>
      ) : (
        <p className="desk">
          <a href="login">Login</a>
        </p>
      )}
      <a href="/">
        <p className="headline">Auto Normalizer</p>
      </a>
      {user ? (
        <p
          className="desk"
          onClick={() => {
            clearAuth();
          }}
        >
          Logout
        </p>
      ) : (
        <p className="desk">
          <a href="register">Sign Up</a>
        </p>
      )}
      <div className="menu-mobile">
        <img
          src="/hamburger.png"
          onClick={() => {
            document.getElementById("menu")?.classList.toggle("menu-show");
          }}
        />
        <div id="menu" className="menu-items">
          {user ? <p>{user.username}</p> : <a href="login">Login</a>}
          {user ? <p>Logout</p> : <a href="register">Sign Up</a>}
        </div>
      </div>
    </nav>
  );
}
