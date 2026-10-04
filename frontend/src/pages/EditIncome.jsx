import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AddExpense.css";

function EditIncome() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [source, setSource] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const loadIncome = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/incomes/${user.id}`
                );

                const data = await response.json();

                const income = data.find(
                    (item) => String(item.id) === String(id)
                );

                if (!income) {
                    setMessage("Income not found");
                    setLoading(false);
                    return;
                }

                setSource(income.source);
                setAmount(income.amount);
                setDate(
                    income.income_date
                        ? income.income_date.substring(0, 10)
                        : ""
                );
                setDescription(income.description || "");
                setLoading(false);
            } catch (error) {
                console.error(error);
                setMessage("Unable to load income");
                setLoading(false);
            }
        };

        loadIncome();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
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
                `http://localhost:5000/api/incomes/${id}`,
                {
                    method: "PUT",
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
                setMessage("Income updated successfully");

                setTimeout(() => {
                    navigate("/dashboard");
                }, 700);
            } else {
                setMessage(data.message || "Update failed");
            }
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    if (loading) {
        return <p>Loading income...</p>;
    }

    return (
        <div className="add-expense-page">
            <div className="add-expense-container">

                <h1>Edit Income</h1>

                <form onSubmit={handleUpdate}>

                    <div className="form-group">
                        <label>Income Source</label>

                        <input
                            type="text"
                            value={source}
                            onChange={(e) => {
                                setSource(e.target.value);
                                setMessage("");
                            }}
                            placeholder="Enter income source"
                        />
                    </div>

                    <div className="form-group">
                        <label>Amount</label>

                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setMessage("");
                            }}
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Date</label>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setMessage("");
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                setMessage("");
                            }}
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        className="add-expense-btn"
                    >
                        Update Income
                    </button>

                </form>

                <p className="message">
                    {message}
                </p>

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

export default EditIncome;