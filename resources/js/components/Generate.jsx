import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken, getCookie } from "../utils/csrf";
import Alert from "./Alert";

const TOPICS = [
    "Let AI do the heavy lifting for you.",
    "AI in Healthcare: Opportunities and Risks",
    "How AI Transforms Small Business Operations",
    "Machine Learning for Predictive Maintenance",
    "Ethics and Governance of AI Systems",
    "AI for Personalized Education",
    "AI-Driven Customer Support Strategies",
    "Generative AI: Use Cases and Best Practices",
    "AI in Finance: Fraud Detection & Automation",
    "Leveraging AI for Marketing Optimization",
    "AI for Climate Modeling and Sustainability",
    "Robotics and AI in Manufacturing",
    "Natural Language Processing: From Theory to Product",
    "Computer Vision Applications in Retail",
    "AI for Healthcare Diagnostics and Imaging",
    "Conversational AI: Building Better Chatbots",
    "AI in Cybersecurity: Threat Detection",
    "Responsible AI: Fairness & Transparency",
    "Scaling AI in Enterprise Environments",
    "Future Trends in AI and Automation",
];

const TEMPLATES = [
    {
        id: "default",
        name: "Default (Clean White)",
        description: "White background, black text",
        preview_image: "url('/templates_previews/default.png')",
    },
    {
        id: "modern",
        name: "Modern (Image Focused)",
        description: "Image background, dark text",
        preview_image: "url('/templates_previews/modern.png')",
    },
    {
        id: "corporate",
        name: "Corporate (Gray Tones)",
        description: "Deep green background, white text",
        preview_image: "url('/templates_previews/corporate.png')",
    },
    {
        id: "vibrant",
        name: "Vibrant (Orange Energy)",
        description: "Bright orange background, dark text",
        preview_image: "url('/templates_previews/vibrant.png')",
    },
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Shapes on background, black text",
        preview_image: "url('/templates_previews/minimalist.png')",
    },
    {
        id: "professional",
        name: "Professional (Navy Blue)",
        description: "Navy blue background, white text",
        preview_image: "url('/templates_previews/professional.png')",
    },
    {
        id: "creative",
        name: "Creative (Purple Innovation)",
        description: "Vivid purple background, light text",
        preview_image: "url('/templates_previews/creative.png')",
    },
    {
        id: "light",
        name: "Cozy (Light Beige)",
        description: "Light background, black text",
        preview_image: "url('/templates_previews/cozy.png')",
    },
];

const Generate = ({ user }) => {
    const [topic, setTopic] = useState("");
    const [slides, setSlides] = useState(5);
    const [template, setTemplate] = useState("default");
    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoaded, setIsFormLoaded] = useState(false);
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("success");

    const pickRandomTopic = useCallback(() => {
        const idx = Math.floor(Math.random() * TOPICS.length);
        return TOPICS[idx];
    }, []);

    useEffect(() => {
        const hasUser =
            user &&
            typeof user === "object" &&
            Object.keys(user).length > 0 &&
            user.id;

        if (!hasUser) {
            fetch("/api/user", {
                headers: { Accept: "application/json" },
                credentials: "include",
            }).catch(() => {
                navigate("/login", { replace: true });
            });
        }

        setTimeout(() => {
            setIsFormLoaded(true);
        }, 100);

        setTopic(pickRandomTopic());
    }, [user, navigate, pickRandomTopic]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await getCsrfToken();
        const xsrfToken = decodeURIComponent(getCookie("XSRF-TOKEN") || "");
        try {
            const response = await fetch("/generate-presentation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": xsrfToken,
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    topic,
                    slides: Number(slides),
                    template,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg =
                    errorData.message ||
                    errorData.error ||
                    (errorData.errors
                        ? Object.values(errorData.errors).flat().join(" ")
                        : "Server error");
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (data.file) {
                window.location.href = `/download-presentation/${data.file}`;
            } else {
                throw new Error("No filename returned from server");
            }
        } catch (error) {
            console.error("Error:", error);

            setModalMessage(`Error: ${error.message}`);
            setModalType("error");
            setModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };
    const handleCardKey = (e, templateId) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setTemplate(templateId);
        }
    };

    return (
        <>
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 text-center">
                    <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin mb-4"></div>
                    <p className="text-lg font-semibold text-gray-800">
                        Generating your presentation... This may take a moment.
                    </p>
                </div>
            )}

            <div
                className={`max-w-4xl w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-8 transition-all duration-600 ease-out ${
                    isFormLoaded
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                }`}
            >
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Generate Your Presentation
                    </h1>
                    <p className="mt-2 text-gray-500">
                        Let AI do the heavy lifting for you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="topic"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Topic
                        </label>
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTopic(pickRandomTopic())}
                        title="Randomize topic"
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm w-full"
                    >
                        Shuffle
                    </button>

                    <div>
                        <label
                            htmlFor="slides"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Number of Slides
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1.586l1.293 1.293a1 1 0 01.293.707V16.5a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012 16.5V7.086a1 1 0 01.293-.707L3.586 5.086V3.5A1.5 1.5 0 015 2h1.5a.5.5 0 01.5.5v1.5H10V2.5a.5.5 0 01.5-.5H12a1.5 1.5 0 011.5 1.5v1.586l1.293 1.293a1 1 0 01.293.707V16.5a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012 16.5V7.086a1 1 0 01.293-.707L3.586 5.086V3.5z" />
                                    <path d="M7.5 8a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />
                                </svg>
                            </div>
                            <input
                                type="number"
                                id="slides"
                                value={slides}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (Number.isNaN(val)) return;
                                    setSlides(Math.max(1, Math.min(20, val)));
                                }}
                                min="1"
                                max="20"
                                required
                                className="block w-full pl-10 pr-3 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Design Template
                        </label>
                        <div
                            role="radiogroup"
                            aria-label="Design template"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        >
                            {TEMPLATES.map((t) => {
                                const isSelected = template === t.id;
                                return (
                                    <div
                                        key={t.id}
                                        role="radio"
                                        aria-checked={isSelected}
                                        tabIndex={0}
                                        onKeyDown={(e) =>
                                            handleCardKey(e, t.id)
                                        }
                                        onClick={() => setTemplate(t.id)}
                                        className={`cursor-pointer rounded-lg border transition-all duration-200 p-1.5 ${
                                            isSelected
                                                ? "ring-2 ring-blue-500 border-transparent shadow-lg"
                                                : "border-gray-200 hover:shadow-md hover:border-gray-300"
                                        }`}
                                    >
                                        <div
                                            className="rounded-md overflow-hidden border"
                                            style={{ borderColor: "#e5e7eb" }}
                                        >
                                            <div
                                                className="flex flex-col justify-center items-center p-2.5 h-[90px]"
                                                style={{
                                                    backgroundImage:
                                                        t.preview_image,

                                                    backgroundSize: "contain",
                                                    backgroundRepeat:
                                                        "no-repeat",
                                                    backgroundPosition:
                                                        "center",
                                                }}
                                            ></div>
                                            <div className="px-2 py-2 bg-white">
                                                <div className="text-xs font-semibold text-gray-700 truncate">
                                                    {t.name}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {t.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-md px-5 py-3.5 text-center transition-transform transform duration-150 ease-in-out active:scale-95"
                    >
                        Generate Presentation
                    </button>
                </form>

                <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <p>
                        Ensure your Laravel and Ollama servers are running
                        correctly.
                    </p>
                </div>
            </div>
            <Alert
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                message={modalMessage}
                type={modalType}
            />
        </>
    );
};

export default Generate;
