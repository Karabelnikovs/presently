import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken, getCookie } from "../utils/csrf";
import Alert from "./Alert";
import { CircleUser, Mail, Key, RotateCcwKey } from "lucide-react";

const Profile = ({ user, setUser }) => {
    console.log(user);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("success");

    const [nameFocused, setNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [pswrdFocused, setPswrdFocused] = useState(false);
    const [pswrdConfFocused, sePswrdConfFocused] = useState(false);

    useEffect(() => {
        const hasUser =
            user &&
            typeof user === "object" &&
            Object.keys(user).length > 0 &&
            user.id;

        if (!hasUser) {
            fetch("/api/profile", {
                headers: { Accept: "application/json" },
                credentials: "include",
            })
                .then((res) => {
                    if (!res.ok) throw new Error("no auth");
                    return res.json();
                })
                .then((data) => {
                    setName(data.name);
                    setEmail(data.email);
                    setUser((prev) => ({ ...prev, ...data }));
                })
                .catch(() => navigate("/login", { replace: true }));

            return;
        }

        setName(user.name);
        setEmail(user.email);
    }, [user, navigate, setUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await getCsrfToken();
        const xsrfToken = decodeURIComponent(getCookie("XSRF-TOKEN") || "");

        const body = { name, email };
        if (password) {
            body.password = password;
            body.password_confirmation = passwordConfirmation;
        }
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": xsrfToken,
                Accept: "application/json",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });
        if (!res.ok) {
            const data = await res.json();
            setModalMessage(data.message || "Update failed");
            setModalType("error");
            setModalOpen(true);
            return;
        }
        setUser({ ...user, name, email });
        await getCsrfToken();

        setModalMessage("Profile updated");
        setModalType("success");
        setModalOpen(true);
    };

    return (
        <div
            className={`max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-600 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
        >
            <h1 className="text-3xl font-bold text-center text-gray-800">
                Profile
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
                        New Password (leave blank to keep current)
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        Confirm New Password
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
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
                            }
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
                    Update Profile
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
export default Profile;
