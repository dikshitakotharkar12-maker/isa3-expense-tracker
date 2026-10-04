import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setMessage("Please enter email and password");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                navigate("/dashboard");
            } else {
                setMessage(
                    data.message || "Invalid email or password"
                );
            }
        } catch (error) {
            console.error("Login error:", error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Welcome Back</h1>

                <p className="auth-subtitle">
                    Login to your Expense Tracker account
                </p>

                <form onSubmit={handleLogin}>

                    <div className="auth-form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setMessage("");
                            }}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setMessage("");
                            }}
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                    >
                        Login
                    </button>

                </form>

                <p className="auth-message">
                    {message}
                </p>

                <p className="auth-link">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create Account
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;