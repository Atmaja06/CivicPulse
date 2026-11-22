import { useState } from "react";
import "./Auth.css";

function Login({ navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage(
      "Login form validated. Account authentication will be enabled after backend integration."
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-icon">C</div>

        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1>Login to CivicPulse</h1>
        <p className="auth-description">
          Sign in to report civic issues and stay updated on your community.
        </p>

        <form className="auth-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="auth-submit">
            Login
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Don't have an account?{" "}
          <button onClick={() => navigate("signup")}>Sign Up</button>
        </p>

        <button className="auth-back" onClick={() => navigate("home")}>
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

export default Login;