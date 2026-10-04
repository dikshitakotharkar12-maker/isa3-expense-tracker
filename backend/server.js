const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// ==============================
// TEST API
// ==============================

app.get("/", (req, res) => {
    res.send("Expense Tracker API is running");
});


// ==============================
// TEST DATABASE
// ==============================

app.get("/api/test-db", (req, res) => {
    db.query("SELECT 1 AS test", (err, result) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Database connection failed"
            });
        }

        res.json({
            message: "Database connected successfully",
            result
        });
    });
});


// ==============================
// REGISTER USER
// ==============================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const checkUser =
            "SELECT * FROM users WHERE email = ?";

        db.query(
            checkUser,
            [email],
            async (err, results) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(400).json({
                        message: "Email already registered"
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(password, 10);

                const sql = `
                    INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        name,
                        email,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {
                            console.error(err);

                            return res.status(500).json({
                                message: "Registration failed"
                            });
                        }

                        res.status(201).json({
                            message:
                                "Registration successful",
                            userId:
                                result.insertId
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// ==============================
// LOGIN USER
// ==============================

app.post("/api/login", (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message:
                "Email and password are required"
        });
    }

    const sql =
        "SELECT * FROM users WHERE email = ?";

    db.query(
        sql,
        [email],
        async (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }

            const user = results[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });
            }

            res.json({
                message:
                    "Login successful",

                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
    );
});


// ==============================
// ADD EXPENSE
// ==============================

app.post("/api/expenses", (req, res) => {

    const {
        user_id,
        title,
        amount,
        category_id,
        expense_date,
        description
    } = req.body;

    if (
        !user_id ||
        !title ||
        !amount ||
        !expense_date
    ) {
        return res.status(400).json({
            message:
                "User, title, amount and date are required"
        });
    }

    const sql = `
        INSERT INTO expenses
        (
            user_id,
            title,
            amount,
            category_id,
            expense_date,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            title,
            amount,
            category_id || null,
            expense_date,
            description || null
        ],
        (err, result) => {

            if (err) {
                console.error(
                    "Add expense error:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to add expense"
                });
            }

            res.status(201).json({
                message:
                    "Expense added successfully",
                expenseId:
                    result.insertId
            });
        }
    );
});


// ==============================
// GET EXPENSES FOR USER
// ==============================

app.get(
    "/api/expenses/:user_id",
    (req, res) => {

        const { user_id } = req.params;

        const sql = `
            SELECT
                expenses.id,
                expenses.title,
                expenses.amount,
                expenses.expense_date,
                expenses.description,
                expenses.category_id,
                categories.category_name
            FROM expenses
            LEFT JOIN categories
                ON expenses.category_id =
                   categories.id
            WHERE expenses.user_id = ?
            ORDER BY
                expenses.expense_date DESC,
                expenses.id DESC
        `;

        db.query(
            sql,
            [user_id],
            (err, results) => {

                if (err) {
                    console.error(
                        "Get expenses error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch expenses"
                    });
                }

                res.json(results);
            }
        );
    }
);


// ==============================
// UPDATE EXPENSE
// ==============================

app.put(
    "/api/expenses/:id",
    (req, res) => {

        const { id } = req.params;

        const {
            user_id,
            title,
            amount,
            category_id,
            expense_date,
            description
        } = req.body;

        if (
            !user_id ||
            !title ||
            !amount ||
            !expense_date
        ) {
            return res.status(400).json({
                message:
                    "User, title, amount and date are required"
            });
        }

        const sql = `
            UPDATE expenses
            SET
                title = ?,
                amount = ?,
                category_id = ?,
                expense_date = ?,
                description = ?
            WHERE id = ?
              AND user_id = ?
        `;

        db.query(
            sql,
            [
                title,
                amount,
                category_id || null,
                expense_date,
                description || null,
                id,
                user_id
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Update expense error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update expense"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message:
                            "Expense not found"
                    });
                }

                res.json({
                    message:
                        "Expense updated successfully"
                });
            }
        );
    }
);


// ==============================
// DELETE EXPENSE
// ==============================

app.delete(
    "/api/expenses/:id",
    (req, res) => {

        const { id } = req.params;

        const sql =
            "DELETE FROM expenses WHERE id = ?";

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {
                    console.error(
                        "Delete expense error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to delete expense"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message:
                            "Expense not found"
                    });
                }

                res.json({
                    message:
                        "Expense deleted successfully"
                });
            }
        );
    }
);


// ==============================
// GET CATEGORIES FOR USER
// OTHER WILL ALWAYS BE LAST
// ==============================

app.get(
    "/api/categories/:user_id",
    (req, res) => {

        const { user_id } = req.params;

        const sql = `
            SELECT
                id,
                category_name
            FROM categories
            WHERE user_id = ?
            ORDER BY
                CASE
                    WHEN category_name = 'Other'
                    THEN 1
                    ELSE 0
                END,
                category_name ASC
        `;

        db.query(
            sql,
            [user_id],
            (err, results) => {

                if (err) {
                    console.error(
                        "Get categories error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch categories"
                    });
                }

                res.json(results);
            }
        );
    }
);


// ==============================
// ADD INCOME
// ==============================

app.post(
    "/api/incomes",
    (req, res) => {

        const {
            user_id,
            source,
            amount,
            income_date,
            description
        } = req.body;

        if (
            !user_id ||
            !source ||
            !amount ||
            !income_date
        ) {
            return res.status(400).json({
                message:
                    "User, source, amount and date are required"
            });
        }

        const sql = `
            INSERT INTO incomes
            (
                user_id,
                source,
                amount,
                income_date,
                description
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                user_id,
                source,
                amount,
                income_date,
                description || null
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Add income error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to add income"
                    });
                }

                res.status(201).json({
                    message:
                        "Income added successfully",
                    incomeId:
                        result.insertId
                });
            }
        );
    }
);


// ==============================
// GET INCOME FOR USER
// ==============================

app.get(
    "/api/incomes/:user_id",
    (req, res) => {

        const { user_id } = req.params;

        const sql = `
            SELECT
                id,
                source,
                amount,
                income_date,
                description
            FROM incomes
            WHERE user_id = ?
            ORDER BY
                income_date DESC,
                id DESC
        `;

        db.query(
            sql,
            [user_id],
            (err, results) => {

                if (err) {
                    console.error(
                        "Get income error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to fetch income"
                    });
                }

                res.json(results);
            }
        );
    }
);


// ==============================
// UPDATE INCOME
// ==============================

app.put(
    "/api/incomes/:id",
    (req, res) => {

        const { id } = req.params;

        const {
            user_id,
            source,
            amount,
            income_date,
            description
        } = req.body;

        if (
            !user_id ||
            !source ||
            !amount ||
            !income_date
        ) {
            return res.status(400).json({
                message:
                    "User, source, amount and date are required"
            });
        }

        const sql = `
            UPDATE incomes
            SET
                source = ?,
                amount = ?,
                income_date = ?,
                description = ?
            WHERE id = ?
              AND user_id = ?
        `;

        db.query(
            sql,
            [
                source,
                amount,
                income_date,
                description || null,
                id,
                user_id
            ],
            (err, result) => {

                if (err) {
                    console.error(
                        "Update income error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to update income"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message:
                            "Income not found"
                    });
                }

                res.json({
                    message:
                        "Income updated successfully"
                });
            }
        );
    }
);


// ==============================
// DELETE INCOME
// ==============================

app.delete(
    "/api/incomes/:id",
    (req, res) => {

        const { id } = req.params;

        const sql =
            "DELETE FROM incomes WHERE id = ?";

        db.query(
            sql,
            [id],
            (err, result) => {

                if (err) {
                    console.error(
                        "Delete income error:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Failed to delete income"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message:
                            "Income not found"
                    });
                }

                res.json({
                    message:
                        "Income deleted successfully"
                });
            }
        );
    }
);


// ==============================
// START SERVER
// ==============================

const PORT = 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on http://localhost:${PORT}`
        );
    }
);