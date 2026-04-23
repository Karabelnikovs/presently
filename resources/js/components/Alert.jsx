import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Alert = ({ isOpen, onClose, message, type = "success" }) => {
    const [render, setRender] = useState(isOpen);
    const [visible, setVisible] = useState(false);
    const ANIM_MS = 600;

    useEffect(() => {
        // Atveram/aizveram modāli ar īsu fade animāciju.
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
        // Auto aizvēršana pēc 5 sekundēm.
        if (!isOpen) return;
        const timer = setTimeout(() => onClose(), 5000);
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
                className={`relative w-full max-w-lg space-y-8 rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-slate-300/50 backdrop-blur transition-all duration-600 ease-out ${
                    visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                }`}
            >
                <div className="flex items-center justify-center mb-4">
                    <div
                        className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white text-2xl`}
                    >
                        {icon}
                    </div>
                </div>

                <p className="text-center text-gray-800 font-medium mb-4">
                    {message}
                </p>

                <div className="flex justify-center">
                    <button
                        onClick={() => onClose()}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white transition duration-150 ease-out hover:brightness-105 active:scale-95"
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

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    message,
    title = "Are you sure?",
    confirmText = "Delete",
    cancelText = "Cancel",
}) => {
    const [render, setRender] = useState(false);
    const [visible, setVisible] = useState(false);
    const ANIM_MS = 600;

    useEffect(() => {
        // Sinhronizējam redzamību ar animācijas stāvokli.
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

    if (!render) return null;

    const content = (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-600 ease-out ${
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
                role="alertdialog"
                aria-modal="true"
                className={`relative w-full max-w-lg space-y-6 rounded-3xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-slate-300/50 backdrop-blur transition-all duration-600 ease-out ${
                    visible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-5"
                }`}
            >
                <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-2xl text-white">
                        🗑
                    </div>
                </div>

                <div className="space-y-2 text-center">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>
                    <p className="text-pretty text-gray-700">{message}</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-center">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-2.5 font-semibold text-white transition duration-150 ease-out hover:brightness-105 active:scale-95 sm:min-w-[8rem]"
                    >
                        {confirmText}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 font-semibold text-slate-700 transition duration-150 ease-out hover:bg-slate-50 active:scale-95 sm:min-w-[8rem]"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document === "undefined") return content;
    return createPortal(content, document.body);
};

export default Alert;
