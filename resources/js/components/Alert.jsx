import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Alert = ({ isOpen, onClose, message, type = "success" }) => {
    const [render, setRender] = useState(isOpen);
    const [visible, setVisible] = useState(false);
    const ANIM_MS = 600;

    useEffect(() => {
        let t;
        if (isOpen) {
            setRender(true);
            t = setTimeout(() => setVisible(true), 20);
        } else {
            setVisible(false);
            t = setTimeout(() => setRender(false), ANIM_MS);
        }
        return () => clearTimeout(t);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => onClose(), 3000);
        return () => clearTimeout(timer);
    }, [isOpen, onClose]);

    if (!render) return null;

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon = type === "success" ? "✔" : "❌";

    const content = (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-600 ease-out ${
                visible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!visible}
        >

            <div
                className={`absolute inset-0 bg-linear-to-br from-[#f9fafb] to-[#dbeafe] bg-opacity-40 transition-opacity duration-600 ${
                    visible ? "opacity-100" : "opacity-0"
                }`}
                onClick={onClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                className={`relative max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-600 ease-out ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                }`}
            >
                <div className="flex items-center justify-center mb-4">
                    <div
                        className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white text-2xl`}
                    >
                        {icon}
                    </div>
                </div>

                <p className="text-center text-gray-800 font-medium mb-4">{message}</p>

                <div className="flex justify-center">
                    <button
                        onClick={() => onClose()}
                        className="w-full bg-blue-600 text-white font-semibold rounded-md px-5 py-2 transition transform duration-150 ease-out active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document === "undefined") return content;
    return createPortal(content, document.body);
};

export default Alert;
