import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddExpense.css";

function AddExpense() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        fetch(`http://localhost:5000/api/categories/${user.id}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("Categories received:", data);
                setCategories(data);
            })
            .catch((error) => {
                console.error("Error fetching categories:", error);
            });
    }, [user?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("Please login first");
            return;
        }

        if (!title.trim() || !amount || !date) {
            setMessage("Please fill all required fields");
            return;
        }

        if (!categoryId) {
            setMessage("Please select a category");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/expenses",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        title: title.trim(),
                        amount: Number(amount),
                        category_id: Number(categoryId),
                        expense_date: date,
                        description: description.trim()
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Expense added successfully");

                setTitle("");
                setAmount("");
                setDate("");
                setDescription("");
                setCategoryId("");
            } else {
                setMessage(data.message || "Failed to add expense");
            }
        } catch (error) {
            console.error("Add expense error:", error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div className="add-expense-page">
            <div className="add-expense-container">

                <h1>Add Expense</h1>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Expense Title</label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setMessage("");
                            }}
                            placeholder="Enter expense title"
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
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>

                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setMessage("");
                            }}
                        >
                            <option value="">
                                Select Category
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.category_name}
                                </option>
                            ))}
                        </select>
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
                            placeholder="Enter description"
                            rows="4"
                        />
                    </div>

                    <button
                        type="submit"
                        className="add-expense-btn"
                    >
                        Add Expense
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

export default AddExpense;