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
import Welcome from "./components/Welcome";

const ProtectedRoute = ({ user, redirectPath = "/login" }) => {
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }
    return <Outlet />;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <BrowserRouter>
            <Navbar user={user} setUser={setUser} />
            <div className="container mx-auto p-4 flex items-center justify-center">
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : (
                    <Routes>
                        <Route element={<ProtectedRoute user={user} />}>
                            <Route
                                path="/generate"
                                element={<Generate user={user} />}
                            />
                            <Route
                                path="/my-presentations"
                                element={<MyPresentations user={user} />}
                            />
                            <Route
                                path="/profile"
                                element={
                                    <Profile user={user} setUser={setUser} />
                                }
                            />
                        </Route>
                        <Route
                            path="/login"
                            element={<Login setUser={setUser} />}
                        />
                        <Route
                            path="/register"
                            element={<Register setUser={setUser} />}
                        />
                        <Route path="/" element={<Welcome />} />
                    </Routes>
                )}
            </div>
        </BrowserRouter>
    );
}

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(<App />);
}
