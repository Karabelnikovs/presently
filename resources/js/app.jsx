import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Generate from "./components/Generate";
import MyPresentations from "./components/MyPresentations";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ user, redirectPath = "/login" }) => {
    const hasUser =
        user &&
        typeof user === "object" &&
        Object.keys(user).length > 0 &&
        user.id;

    if (!hasUser) {
        return <Navigate to={redirectPath} replace />;
    }
    return <Outlet />;
};

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("/api/user", {
            headers: {
                Accept: "application/json",
            },
            credentials: "include",
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error("Not authenticated");
            })
            .then((data) => setUser(data))
            .catch(() => setUser(null));
    }, []);

    return (
        <BrowserRouter>
            <Navbar user={user} setUser={setUser} />
            <div className="container mx-auto p-4 flex items-center justify-center">
                <Routes>
                    <Route element={<ProtectedRoute user={user} />}>
                        <Route
                            path="/generate"
                            element={<Generate user={user} />}
                        />
                    </Route>
                    <Route
                        path="/my-presentations"
                        element={<MyPresentations user={user} />}
                    />
                    <Route
                        path="/profile"
                        element={<Profile user={user} setUser={setUser} />}
                    />
                    <Route
                        path="/login"
                        element={<Login setUser={setUser} />}
                    />
                    <Route
                        path="/register"
                        element={<Register setUser={setUser} />}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(<App />);
}
