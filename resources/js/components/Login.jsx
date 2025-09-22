import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken, getCookie } from '../utils/csrf';
import Alert from './Alert';

const Login = ({ setUser }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('success');

    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        await getCsrfToken();
        const xsrfToken = decodeURIComponent(getCookie('XSRF-TOKEN') || '');
        const res = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-XSRF-TOKEN": xsrfToken,
                Accept: "application/json",
            },
            body: new URLSearchParams({ email, password }),
            credentials: "include",
        });
        if (!res.ok) {
            const data = await res.json();
            setModalMessage(data.message || "Login failed");
            setModalType('error');
            setModalOpen(true);

            return;
        }
        const data = await res.json();
        setUser(data.user);
        await getCsrfToken();
        navigate("/generate");
    };
    return (
        <div
            className={`max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-600 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
        >
            <h1 className="text-3xl font-bold text-center text-gray-800">
                Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold rounded-md px-5 py-2 transition transform duration-150 ease-out active:scale-95"
                >
                    Login
                </button>
            </form>
            <Alert
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={modalMessage}
                type={modalType}
            />
        </div>
    );
};
export default Login;
