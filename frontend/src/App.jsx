import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import AddIncome from "./pages/AddIncome";
import EditExpense from "./pages/EditExpense";
import EditIncome from "./pages/EditIncome";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/add-expense"
                    element={<AddExpense />}
                />

                <Route
                    path="/add-income"
                    element={<AddIncome />}
                />

                <Route
                    path="/edit-expense/:id"
                    element={<EditExpense />}
                />

                <Route
                    path="/edit-income/:id"
                        element={<EditIncome />}
                  />

            </Routes>

        </BrowserRouter>
    );
}

export default App;