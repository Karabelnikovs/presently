import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const MyPresentations = ({ user }) => {
    const [presentations, setPresentations] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchFocused, setSearchFocused] = useState(false);
    const itemsPerPage = 5;

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

    const filteredPresentations = presentations.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPresentations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPresentations = filteredPresentations.slice(
        startIndex,
        endIndex
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 4; i <= totalPages; i++)
                    pages.push(i);
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++)
                    pages.push(i);
                pages.push("...");
                pages.push(totalPages);
            }
        }
        return pages;
    };

    return (
        <div
            className={`max-w-4xl w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-6 transition-all duration-600 ease-out ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
        >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
                My Presentations
            </h1>

            <div
                className={`relative transition-all duration-300 ${
                    loaded ? "opacity-100" : "opacity-0"
                }`}
            >
                <div
                    className={`relative flex items-center transition-all duration-300 ${
                        searchFocused ? "transform scale-[1.02]" : ""
                    }`}
                >
                    <Search
                        className={`absolute left-4 transition-all duration-300 ${
                            searchFocused ? "text-blue-600" : "text-gray-400"
                        }`}
                        size={20}
                    />
                    <input
                        id="search"
                        name="search"
                        type="text"
                        placeholder="Search presentations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                            searchFocused
                                ? "border-blue-600 shadow-lg shadow-blue-100"
                                : "border-gray-200 shadow-sm"
                        } focus:ring-0`}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            ×
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="text-sm text-gray-500 mt-2 animate-fadeIn">
                        Found {filteredPresentations.length} presentation
                        {filteredPresentations.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            {filteredPresentations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {searchQuery
                            ? "No presentations match your search."
                            : "No presentations yet. Generate one!"}
                    </p>
                </div>
            ) : (
                <>
                    <ul className="space-y-3">
                        {currentPresentations.map((p, idx) => (
                            <li
                                key={p.id}
                                className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 animate-slideIn"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <span className="text-gray-700 mb-2 sm:mb-0 break-words font-medium">
                                    {p.title}
                                </span>
                                <a
                                    href={`/download-presentation/${p.filename}`}
                                    className="text-blue-600 hover:text-blue-700 hover:underline shrink-0 font-medium transition-colors duration-200"
                                >
                                    Download
                                </a>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                name="previous"
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {getPageNumbers().map((page, idx) =>
                                page === "..." ? (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="px-2 text-gray-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`min-w-[40px] h-10 rounded-lg font-medium transition-all duration-200 ${
                                            currentPage === page
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                : "border border-gray-300 hover:bg-gray-50 text-gray-700 hover:shadow-sm"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                name="next"
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <p className="text-center text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>
                    )}
                </>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                    opacity: 0;
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default MyPresentations;
