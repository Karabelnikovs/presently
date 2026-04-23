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
            <main className="flex min-h-[calc(100vh-84px)] w-full items-center justify-center">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/90 px-6 py-4 text-center text-slate-600 shadow-lg backdrop-blur">
                        Loading...
                    </div>
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
                        <Route
                            path="/"
                            element={user ? <Navigate to="/generate" replace /> : <Welcome />}
                        />
                    </Routes>
                )}
            </main>
        </BrowserRouter>
    );
}

const container = document.getElementById("root");
if (container) {
    createRoot(container).render(<App />);
}
