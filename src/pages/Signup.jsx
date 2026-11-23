
import { useState } from "react";
import "./Auth.css";
import { registerUser } from "../services/authService";

function Signup({ navigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Creating your account...");

      const data = await registerUser(
        name,
        email,
        password,
        phone
      );

      if (data.session) {
        setMessage("Account created successfully!");
        navigate("home");
      } else {
        setMessage(
          "Account created! Please check your email to verify your account before logging in."
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(
        error.message || "Account creation failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">

        <div className="auth-icon">C</div>

        <p className="auth-eyebrow">JOIN YOUR COMMUNITY</p>

        <h1>Create an Account</h1>

        <p className="auth-description">
          Join CivicPulse and help make your neighbourhood better.
        </p>

        <form className="auth-form" onSubmit={handleSignup}>
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="signup-phone">Mobile Number</label>
          <input
            id="signup-phone"
            type="tel"
            placeholder="Enter your mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <p className="auth-switch">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("login")}>
            Login
          </button>
        </p>

        <button
          type="button"
          className="auth-back"
          onClick={() => navigate("home")}
        >
          ← Back to Home
        </button>

      </div>
    </div>
  );
}

export default Signup;
