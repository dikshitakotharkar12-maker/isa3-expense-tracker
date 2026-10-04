import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddExpense.css";

function AddIncome() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const [source, setSource] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("Please login first");
            return;
        }

        if (!source.trim() || !amount || !date) {
            setMessage("Please fill all required fields");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/incomes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        source: source.trim(),
                        amount: Number(amount),
                        income_date: date,
                        description: description.trim()
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Income added successfully");
                setSource("");
                setAmount("");
                setDate("");
                setDescription("");
            } else {
                setMessage(data.message || "Failed to add income");
            }
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="add-expense-page">
            <div className="add-expense-container">

                <h1>Add Income</h1>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Income Source</label>
                        <input
                            type="text"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            placeholder="e.g. Salary"
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        className="add-expense-btn"
                    >
                        Add Income
                    </button>
                </form>

                <p className="message">{message}</p>

                <button
                    className="back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default AddIncome;