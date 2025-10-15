import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken, getCookie } from "../utils/csrf";
import Alert from "./Alert";
import MiniLoaderMemo from "./MiniLoaderMemo";
import { Search, Presentation } from "lucide-react";

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
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoaded, setIsFormLoaded] = useState(false);
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("success");

    const [isDragging, setIsDragging] = useState(false);
    const [topicFocused, setTopicFocused] = useState(false);
    const [countFocused, setCountFocused] = useState(false);

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

    const handleFileChange = (e) => {
        const selectedFile = e.dataTransfer
            ? e.dataTransfer.files[0]
            : e.target.files[0];

        const fileInput = document.getElementById("docx_file");
        if (fileInput) {
            fileInput.value = "";
        }

        if (!selectedFile) return;

        if (
            selectedFile.type !==
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            setFile(null);
            setModalMessage("Please upload a valid .docx file.");
            setModalType("error");
            setModalOpen(true);
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setFile(null);
            setModalMessage("File size cannot exceed 5MB.");
            setModalType("error");
            setModalOpen(true);
            return;
        }

        setFile(selectedFile);
        setTopic("");
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFileChange(e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await getCsrfToken();
        const xsrfToken = decodeURIComponent(getCookie("XSRF-TOKEN") || "");

        const formData = new FormData();
        formData.append("topic", topic);
        formData.append("slides", Number(slides));
        formData.append("template", template);
        if (file) {
            formData.append("docx_file", file);
        }

        try {
            const response = await fetch("/generate-presentation", {
                method: "POST",
                headers: {
                    "X-XSRF-TOKEN": xsrfToken,
                    Accept: "application/json",
                },
                body: formData,
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
            {/* {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 text-center">
                    <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-10 h-10 animate-spin mb-4"></div>
                    <p className="text-lg font-semibold text-gray-800">
                        Generating your presentation... This may take a moment.
                    </p>
                </div>
            )} */}
            <MiniLoaderMemo
                isLoading={isLoading}
                onFinish={() => setIsLoading(false)}
            />

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
                            Topic (or upload a .docx file below)
                        </label>
                        <div className="relative flex gap-2">
                            <div
                                className={`relative flex-1 focus:ring-0 transition-all duration-300  ${
                                    topicFocused ? "transform scale-[1.02]" : ""
                                }`}
                            >
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search
                                        className={`absolute left-4 transition-all duration-300 ${
                                            topicFocused
                                                ? "text-blue-600"
                                                : "text-gray-400"
                                        }`}
                                        size={20}
                                    />
                                </div>
                                <input
                                    type="text"
                                    id="topic"
                                    name="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    required
                                    onFocus={() => setTopicFocused(true)}
                                    onBlur={() => setTopicFocused(false)}
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                                        topicFocused
                                            ? "border-blue-600 shadow-lg shadow-blue-100"
                                            : "border-gray-200 shadow-sm"
                                    } `}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setTopic(pickRandomTopic())}
                        title="Randomize topic"
                        className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm w-full  transition transform duration-150 ease-out active:scale-95 active:shadow-lg"
                    >
                        Shuffle
                    </button>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Upload .docx File (Optional)
                        </label>
                        <label
                            htmlFor="docx_file"
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`relative group flex flex-col justify-center items-center w-full h-48 rounded-lg border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer
                            ${
                                isDragging
                                    ? "border-blue-500 bg-blue-50 scale-105"
                                    : "border-gray-300 hover:border-blue-400"
                            }
                            ${file ? "border-green-500 bg-green-50" : ""}`}
                        >
                            <input
                                id="docx_file"
                                name="docx_file"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".docx"
                            />
                            {file ? (
                                <div className="text-center p-4 transition-opacity duration-300 opacity-100">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mx-auto h-12 w-12 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm font-semibold text-gray-800 break-all px-2">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors z-10"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center transition-transform duration-300 group-hover:scale-105">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                        <span className="font-semibold text-blue-600">
                                            Upload a file
                                        </span>{" "}
                                        or drag and drop
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        DOCX up to 5MB
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>

                    <div>
                        <label
                            htmlFor="slides"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Number of Slides
                        </label>
                        <div
                            className={`relative focus:ring-0 transition-all duration-300  ${
                                countFocused ? "transform scale-[1.02]" : ""
                            }`}
                        >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Presentation
                                    className={`absolute left-4 transition-all duration-300 ${
                                        countFocused
                                            ? "text-blue-600"
                                            : "text-gray-400"
                                    }`}
                                    size={20}
                                />
                            </div>
                            <input
                                type="number"
                                id="slides"
                                name="slides"
                                value={slides}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (Number.isNaN(val)) return;
                                    setSlides(Math.max(1, Math.min(20, val)));
                                }}
                                min="1"
                                max="20"
                                required
                                onFocus={() => setCountFocused(true)}
                                onBlur={() => setCountFocused(false)}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-300 outline-none ${
                                    countFocused
                                        ? "border-blue-600 shadow-lg shadow-blue-100"
                                        : "border-gray-200 shadow-sm"
                                } `}
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
                        className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-2 transition transform duration-150 ease-out active:scale-95 shadow-md shadow-blue-200 hover:shadow-lg"
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
