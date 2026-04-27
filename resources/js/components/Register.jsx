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
        // Aktivizējam vieglu formas parādīšanās animāciju.
        setTimeout(() => setLoaded(true), 100);
    }, []);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [pswrdFocused, setPswrdFocused] = useState(false);
    const [pswrdConfFocused, sePswrdConfFocused] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        // Reģistrācijas pieprasījumam pievienojam CSRF tokenu.
        try {
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
                // Attēlojam backend validācijas/servisa kļūdu.
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
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div
            className={`w-full max-w-lg space-y-8 rounded-3xl border border-white/80 bg-white/85 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur transition-all duration-600 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
        >
            <h1 className="text-center text-3xl font-bold text-slate-900">
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
                            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 outline-none transition-all duration-300 ${
                                nameFocused
                                    ? "border-blue-500 shadow-lg shadow-blue-100"
                                    : "border-slate-200 bg-white shadow-sm"
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
                            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 outline-none transition-all duration-300 ${
                                emailFocused
                                    ? "border-blue-500 shadow-lg shadow-blue-100"
                                    : "border-slate-200 bg-white shadow-sm"
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
                            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 outline-none transition-all duration-300 ${
                                pswrdFocused
                                    ? "border-blue-500 shadow-lg shadow-blue-100"
                                    : "border-slate-200 bg-white shadow-sm"
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
                            className={`w-full rounded-xl border-2 py-3 pl-12 pr-4 outline-none transition-all duration-300 ${
                                pswrdConfFocused
                                    ? "border-blue-500 shadow-lg shadow-blue-100"
                                    : "border-slate-200 bg-white shadow-sm"
                            } `}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-blue-200 transition duration-150 ease-out hover:brightness-105 active:scale-95"
                >
                    {isSubmitting ? "Registering..." : "Register"}
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
