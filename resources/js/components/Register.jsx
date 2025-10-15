import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken, getCookie } from "../utils/csrf";
import Alert from "./Alert";
import { CircleUser, Mail, Key, RotateCcwKey } from "lucide-react";

const Register = ({ setUser }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("success");

    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const navigate = useNavigate();
    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [pswrdFocused, setPswrdFocused] = useState(false);
    const [pswrdConfFocused, sePswrdConfFocused] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        await getCsrfToken();
        const xsrfToken = decodeURIComponent(getCookie("XSRF-TOKEN") || "");
        const res = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-XSRF-TOKEN": xsrfToken,
                Accept: "application/json",
            },
            body: new URLSearchParams({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            }),
            credentials: "include",
        });
        if (!res.ok) {
            const data = await res.json();
            setModalMessage(data.message || "Registration failed");
            setModalType("error");
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
                Register
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Name
                    </label>
                    <div
                        className={`relative flex-1 focus:ring-0 transition-all duration-300  ${
                            nameFocused ? "transform scale-[1.02]" : ""
                        }`}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CircleUser
                                className={`absolute left-4 transition-all duration-300 ${
                                    nameFocused
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                }`}
                                size={20}
                            />
                        </div>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            onFocus={() => setNameFocused(true)}
                            onBlur={() => setNameFocused(false)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                                nameFocused
                                    ? "border-blue-600 shadow-lg shadow-blue-100"
                                    : "border-gray-200 shadow-sm"
                            } `}
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Email
                    </label>
                    <div
                        className={`relative flex-1 focus:ring-0 transition-all duration-300  ${
                            emailFocused ? "transform scale-[1.02]" : ""
                        }`}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail
                                className={`absolute left-4 transition-all duration-300 ${
                                    emailFocused
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                }`}
                                size={20}
                            />
                        </div>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                                emailFocused
                                    ? "border-blue-600 shadow-lg shadow-blue-100"
                                    : "border-gray-200 shadow-sm"
                            } `}
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Password
                    </label>
                    <div
                        className={`relative flex-1 focus:ring-0 transition-all duration-300  ${
                            pswrdFocused ? "transform scale-[1.02]" : ""
                        }`}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key
                                className={`absolute left-4 transition-all duration-300 ${
                                    pswrdFocused
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                }`}
                                size={20}
                            />
                        </div>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            onFocus={() => setPswrdFocused(true)}
                            onBlur={() => setPswrdFocused(false)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                                pswrdFocused
                                    ? "border-blue-600 shadow-lg shadow-blue-100"
                                    : "border-gray-200 shadow-sm"
                            } `}
                        />
                    </div>
                </div>
                <div>
                    <label
                        htmlFor="password_confirmation"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Confirm Password
                    </label>
                    <div
                        className={`relative flex-1 focus:ring-0 transition-all duration-300  ${
                            pswrdConfFocused ? "transform scale-[1.02]" : ""
                        }`}
                    >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <RotateCcwKey
                                className={`absolute left-4 transition-all duration-300 ${
                                    pswrdConfFocused
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                }`}
                                size={20}
                            />
                        </div>
                        <input
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
                            }
                            required
                            onFocus={() => sePswrdConfFocused(true)}
                            onBlur={() => sePswrdConfFocused(false)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                                pswrdConfFocused
                                    ? "border-blue-600 shadow-lg shadow-blue-100"
                                    : "border-gray-200 shadow-sm"
                            } `}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-2 transition transform duration-150 ease-out active:scale-95 shadow-md shadow-blue-200 hover:shadow-lg"
                >
                    Register
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
export default Register;
