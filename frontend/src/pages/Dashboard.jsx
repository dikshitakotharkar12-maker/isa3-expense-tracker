import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import "../styles/Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);

    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);

    const [loading, setLoading] = useState(true);

    // =========================
    // FETCH EXPENSES + INCOME
    // =========================
    const fetchDashboardData = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        try {
            const expenseResponse = await fetch(
                `http://localhost:5000/api/expenses/${user.id}`
            );

            const incomeResponse = await fetch(
                `http://localhost:5000/api/incomes/${user.id}`
            );

            const expenseData = await expenseResponse.json();
            const incomeData = await incomeResponse.json();

            setExpenses(expenseData);
            setIncomes(incomeData);

            const expenseTotal = expenseData.reduce(
                (sum, expense) => {
                    return sum + Number(expense.amount);
                },
                0
            );

            const incomeTotal = incomeData.reduce(
                (sum, income) => {
                    return sum + Number(income.amount);
                },
                0
            );

            setTotalExpenses(expenseTotal);
            setTotalIncome(incomeTotal);

        } catch (error) {
            console.error(
                "Error fetching dashboard data:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // =========================
    // DELETE EXPENSE
    // =========================
    const handleDeleteExpense = async (expenseId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/expenses/${expenseId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (response.ok) {
                fetchDashboardData();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(
                "Delete expense error:",
                error
            );

            alert("Unable to connect to server");
        }
    };

    // =========================
    // DELETE INCOME
    // =========================
    const handleDeleteIncome = async (incomeId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this income?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/incomes/${incomeId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (response.ok) {
                fetchDashboardData();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(
                "Delete income error:",
                error
            );

            alert("Unable to connect to server");
        }
    };

    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    // =========================
    // CATEGORY DATA FOR CHART
    // =========================
    const categoryTotals = {};

    expenses.forEach((expense) => {

        const category =
            expense.category_name ||
            "Uncategorized";

        if (!categoryTotals[category]) {
            categoryTotals[category] = 0;
        }

        categoryTotals[category] += Number(
            expense.amount
        );
    });

    const categoryData = Object.entries(
        categoryTotals
    ).map(([name, value]) => ({
        name,
        value
    }));

    const chartColors = [
        "#2563eb",
        "#16a34a",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#ec4899",
        "#6b7280"
    ];

    // =========================
    // BALANCE
    // =========================
    const totalBalance =
        totalIncome - totalExpenses;

    // =========================
    // PAGE
    // =========================
    return (
        <div className="dashboard-page">

            {/* =========================
                HEADER
            ========================= */}

            <header className="topbar">

                <div>
                    <h1>
                        Expense Tracker
                    </h1>

                    <p>
                        Manage your daily expenses easily
                    </p>
                </div>

                <nav className="nav-links">

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </nav>

            </header>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="dashboard-container">

                {/* WELCOME */}

                <div className="welcome-section">

                    <h2>
                        Welcome,{" "}
                        {user
                            ? user.name
                            : "User"}!
                    </h2>

                    <p>
                        Here's an overview
                        of your finances.
                    </p>

                </div>


                {/* =========================
                    SUMMARY CARDS
                ========================= */}

                <div className="summary-cards">

                    <div className="summary-card">

                        <h3>
                            Total Income
                        </h3>

                        <p>
                            ₹
                            {totalIncome.toFixed(
                                2
                            )}
                        </p>

                    </div>


                    <div className="summary-card">

                        <h3>
                            Total Balance
                        </h3>

                        <p>
                            ₹
                            {totalBalance.toFixed(
                                2
                            )}
                        </p>

                    </div>


                    <div className="summary-card expense-card">

                        <h3>
                            Total Expenses
                        </h3>

                        <p>
                            ₹
                            {totalExpenses.toFixed(
                                2
                            )}
                        </p>

                    </div>

                </div>


                {/* =========================
                    ADD BUTTONS
                ========================= */}

                <div className="action-section">

                    <button
                        className="primary-btn"
                        onClick={() =>
                            navigate(
                                "/add-income"
                            )
                        }
                    >
                        + Add Income
                    </button>

                    <button
                        className="primary-btn"
                        onClick={() =>
                            navigate(
                                "/add-expense"
                            )
                        }
                    >
                        + Add Expense
                    </button>

                </div>


                {/* =========================
                    PIE CHART
                ========================= */}

                {categoryData.length > 0 && (

                    <section className="chart-section">

                        <div className="section-header">

                            <h2>
                                Expenses by Category
                            </h2>

                        </div>

                        <div className="chart-container">

                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >

                                <PieChart>

                                    <Pie
                                        data={categoryData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={120}
                                        label
                                    >

                                        {categoryData.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        entry.name
                                                    }
                                                    fill={
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip
                                        formatter={(value) =>
                                            `₹${Number(
                                                value
                                            ).toFixed(
                                                2
                                            )}`
                                        }
                                    />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    </section>
                )}


                {/* =========================
                    RECENT INCOME
                ========================= */}

                <section className="income-section">

                    <div className="section-header">

                        <h2>
                            Recent Income
                        </h2>

                        <span>
                            {incomes.length}{" "}
                            {incomes.length === 1
                                ? "income"
                                : "incomes"}
                        </span>

                    </div>


                    {loading ? (

                        <p>
                            Loading income...
                        </p>

                    ) : incomes.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                No income records yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/add-income"
                                    )
                                }
                            >
                                Add Your First Income
                            </button>

                        </div>

                    ) : (

                        <div className="expense-list">

                            {incomes.map(
                                (income) => (

                                <div
                                    className="expense-card-row"
                                    key={income.id}
                                >

                                    {/* INCOME INFO */}

                                    <div className="expense-info">

                                        <h3>
                                            {income.source}
                                        </h3>

                                        <p>
                                            {income.description ||
                                                "No description"}
                                        </p>

                                    </div>


                                    {/* INCOME AMOUNT */}

                                    <div className="expense-details">

                                        <strong>
                                            ₹
                                            {Number(
                                                income.amount
                                            ).toFixed(
                                                2
                                            )}
                                        </strong>

                                        <span>
                                            {new Date(
                                                income.income_date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </span>

                                    </div>


                                    {/* INCOME BUTTONS */}

                                    <div className="expense-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/edit-income/${income.id}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteIncome(
                                                    income.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* =========================
                    RECENT EXPENSES
                ========================= */}

                <section className="expense-section">

                    <div className="section-header">

                        <h2>
                            Recent Expenses
                        </h2>

                        <span>
                            {expenses.length}{" "}
                            {expenses.length === 1
                                ? "expense"
                                : "expenses"}
                        </span>

                    </div>


                    {loading ? (

                        <p>
                            Loading expenses...
                        </p>

                    ) : expenses.length === 0 ? (

                        <div className="empty-state">

                            <p>
                                No expenses yet.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/add-expense"
                                    )
                                }
                            >
                                Add Your First Expense
                            </button>

                        </div>

                    ) : (

                        <div className="expense-list">

                            {expenses.map(
                                (expense) => (

                                <div
                                    className="expense-card-row"
                                    key={expense.id}
                                >

                                    {/* EXPENSE INFO */}

                                    <div className="expense-info">

                                        <h3>
                                            {expense.title}
                                        </h3>

                                        <p>
                                            {expense.description ||
                                                "No description"}
                                        </p>

                                        <span>
                                            Category:{" "}
                                            {expense.category_name ||
                                                "Uncategorized"}
                                        </span>

                                    </div>


                                    {/* EXPENSE AMOUNT */}

                                    <div className="expense-details">

                                        <strong>
                                            ₹
                                            {Number(
                                                expense.amount
                                            ).toFixed(
                                                2
                                            )}
                                        </strong>

                                        <span>
                                            {new Date(
                                                expense.expense_date
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )}
                                        </span>

                                    </div>


                                    {/* EXPENSE BUTTONS */}

                                    <div className="expense-actions">

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/edit-expense/${expense.id}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDeleteExpense(
                                                    expense.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default Dashboard;