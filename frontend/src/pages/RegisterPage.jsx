// frontend/src/pages/RegisterPage.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Auth.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password) {
            setMessage("Please fill all fields");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Registration successful");

                setName("");
                setEmail("");
                setPassword("");

                setTimeout(() => {
                    navigate("/login");
                }, 800);
            } else {
                setMessage(
                    data.message || "Registration failed"
                );
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Create your Expense Tracker account
                </p>

                <form onSubmit={handleRegister}>

                    <div className="auth-form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setMessage("");
                            }}
                            placeholder="Enter your name"
                        />
                    </div>

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
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                    >
                        Register
                    </button>

                </form>

                <p className="auth-message">
                    {message}
                </p>

                <p className="auth-link">
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default RegisterPage;