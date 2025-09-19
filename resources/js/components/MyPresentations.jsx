import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyPresentations = ({ user }) => {
    const [presentations, setPresentations] = useState([]);
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        setTimeout(() => setLoaded(true), 100);
    }, []);
    const navigate = useNavigate();

    useEffect(() => {
        const hasUser =
            user &&
            typeof user === "object" &&
            Object.keys(user).length > 0 &&
            user.id;

        fetch("/api/my-presentations", {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("no auth");
                return res.json();
            })
            .then(setPresentations)
            .catch(() => {
                if (!hasUser) {
                    navigate("/login", { replace: true });
                } else {
                    navigate("/login", { replace: true });
                }
            });
    }, [user, navigate]);

    return (
        <>
            <div
                className={`max-w-4xl w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-8 transition-all duration-600 ease-out ${
                    loaded
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                }`}
            >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
                    My Presentations
                </h1>
                {presentations.length === 0 ? (
                    <p className="text-gray-500 text-center">
                        No presentations yet. Generate one!
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {presentations.map((p) => (
                            <li
                                key={p.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3"
                            >
                                <span className="text-gray-700 mb-2 sm:mb-0 break-words">
                                    {p.title}
                                </span>
                                <a
                                    href={`/download-presentation/${p.filename}`}
                                    className="text-blue-600 hover:underline shrink-0"
                                >
                                    Download
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};
export default MyPresentations;
