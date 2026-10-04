import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditExpense() {
    const { id } = useParams();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const loadData = async () => {
            try {
                const expenseResponse = await fetch(
                    `http://localhost:5000/api/expenses/${user.id}`
                );

                const expenseData = await expenseResponse.json();

                const expense = expenseData.find(
                    (item) => String(item.id) === String(id)
                );

                if (!expense) {
                    setMessage("Expense not found");
                    setLoading(false);
                    return;
                }

                setTitle(expense.title);
                setAmount(expense.amount);
                setDate(
                    expense.expense_date
                        ? expense.expense_date.substring(0, 10)
                        : ""
                );
                setDescription(expense.description || "");

                const categoryResponse = await fetch(
                    `http://localhost:5000/api/categories/${user.id}`
                );

                const categoryData = await categoryResponse.json();

                setCategories(categoryData);

                if (expense.category_id) {
                    setCategoryId(String(expense.category_id));
                } else {
                    const matchingCategory = categoryData.find(
                        (category) =>
                            category.category_name === expense.category_name
                    );

                    if (matchingCategory) {
                        setCategoryId(String(matchingCategory.id));
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                setMessage("Unable to load expense");
                setLoading(false);
            }
        };

        loadData();
    }, [id, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("Please login first");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/expenses/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: user.id,
                        title: title.trim(),
                        amount: Number(amount),
                        category_id: categoryId
                            ? Number(categoryId)
                            : null,
                        expense_date: date,
                        description: description.trim()
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage("Expense updated successfully");

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
        return <p>Loading expense...</p>;
    }

    return (
        <div>
            <h1>Edit Expense</h1>

            <form onSubmit={handleUpdate}>
                <div>
                    <label>Expense Title</label>
                    <br />
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <br />

                <div>
                    <label>Amount</label>
                    <br />
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="0"
                        step="0.01"
                    />
                </div>

                <br />

                <div>
                    <label>Category</label>
                    <br />

                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Select Category</option>

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

                <br />

                <div>
                    <label>Date</label>
                    <br />

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <br />

                <div>
                    <label>Description</label>
                    <br />

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                    />
                </div>

                <br />

                <button type="submit">
                    Update Expense
                </button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default EditExpense;