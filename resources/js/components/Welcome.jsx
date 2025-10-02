import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Welcome = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen  flex flex-col">
            <section className="relative flex-1 flex items-center justify-center text-center px-4 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-200/30 to-transparent opacity-50 animate-pulse"></div>
                <div
                    className={`max-w-4xl mx-auto space-y-6 transition-all duration-1000 ${
                        isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-10"
                    }`}
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                        Generate Stunning{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            AI-Powered
                        </span>{" "}
                        Presentations
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
                        Let AI handle the heavy lifting. Create professional
                        slides in minutes with intelligent topics, templates,
                        and content generation.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Link
                            to="/register"
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                            Get Started Free
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl border border-blue-200 transform hover:scale-105 transition-all duration-300"
                        >
                            Log In
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-20 ">
                <div className="max-w-6xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
                        Why Choose Presently Generator?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Intelligent Topic Suggestions",
                                description:
                                    "Get inspired with AI-curated topics or upload your own documents for personalized content.",
                                icon: "💡",
                            },
                            {
                                title: "Stunning Templates",
                                description:
                                    "Choose from modern, vibrant designs that make your presentations pop.",
                                icon: "🎨",
                            },
                            {
                                title: "Your Content Based Generation",
                                description:
                                    "Use your uploaded files to generate relevant slides that match your unique needs.",
                                icon: "💻",
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className={`p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-2 transition-all duration-500 delay-${
                                    index * 100
                                }`}
                            >
                                <div className="text-4xl mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Welcome;
