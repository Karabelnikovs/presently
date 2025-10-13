import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen w-full flex flex-col">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float 6s ease-in-out 2s infinite;
                }
                .card-hover {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-hover:hover {
                    transform: translateY(-8px);
                }
            `}</style>

            <section className="relative flex-1 flex items-center justify-center text-center px-4 py-16 md:py-24">
                <div
                    className={`max-w-5xl mx-auto space-y-8 transition-all duration-1000 ${
                        isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-10"
                    }`}
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight">
                        Create Beautiful
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400">
                            Presentations
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform your ideas into stunning slides. Simple, fast,
                        and beautifully designed.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
                        <Link
                            to="/register"
                            className="group px-10 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                            <span className="inline-flex items-center gap-2">
                                Get Started Free
                                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">
                                    →
                                </span>
                            </span>
                        </Link>
                        <Link
                            to="/login"
                            className="px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-md hover:shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105"
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
                        Everything You Need
                    </h2>
                    <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
                        Powerful features to help you create presentations that
                        stand out
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Smart Topics",
                                description:
                                    "Get inspired with curated suggestions or upload your own documents for personalized content.",
                                icon: (
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                        />
                                    </svg>
                                ),
                                delay: "0ms",
                            },
                            {
                                title: "Beautiful Templates",
                                description:
                                    "Choose from clean, modern templates designed to make your content shine.",
                                icon: (
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                        />
                                    </svg>
                                ),
                                delay: "150ms",
                            },
                            {
                                title: "Your Content",
                                description:
                                    "Upload your files and generate slides that match your unique story and vision.",
                                icon: (
                                    <svg
                                        className="w-12 h-12"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                ),
                                delay: "300ms",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
                                style={{ animationDelay: feature.delay }}
                            >
                                <div className="text-blue-600 mb-6 animate-float">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-20 px-4">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-12 md:p-16 shadow-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
                        Join Presently to start creating amazing presentations
                        every day
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-10 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        Start Creating Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Welcome;
