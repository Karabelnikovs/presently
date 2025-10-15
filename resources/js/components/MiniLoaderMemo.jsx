import React, { useEffect, useMemo, useState } from "react";

export default function MiniLoaderMemo({
    isLoading = true,
    onFinish = () => {},
}) {
    const PAIRS = 8;

    const icons = useMemo(
        () => [
            "🍎",
            "🍊",
            "🍇",
            "🍓",
            "🍉",
            "🍌",
            "🥝",
            "🍒",
            "🥭",
            "🍍",
            "🥥",
            "🍑",
        ],
        []
    );

    function makeDeck(pairs = PAIRS) {
        const chosen = icons.slice(0, pairs);
        const deck = [];
        let id = 0;
        chosen.forEach((icon) => {
            deck.push({ id: id++, icon, matched: false });
            deck.push({ id: id++, icon, matched: false });
        });

        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    const [deck, setDeck] = useState(() => makeDeck());
    const [flipped, setFlipped] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [matchedCount, setMatchedCount] = useState(0);

    useEffect(() => {
        if (isLoading) {
            setDeck(makeDeck());
            setFlipped([]);
            setDisabled(false);
            setMatchedCount(0);
        }
    }, [isLoading]);

    useEffect(() => {
        if (flipped.length === 2) {
            setDisabled(true);
            const [a, b] = flipped;
            if (deck[a].icon === deck[b].icon) {
                setTimeout(() => {
                    setDeck((d) => {
                        const copy = d.slice();
                        copy[a] = { ...copy[a], matched: true };
                        copy[b] = { ...copy[b], matched: true };
                        return copy;
                    });
                    setMatchedCount((c) => c + 1);
                    setFlipped([]);
                    setDisabled(false);
                }, 420);
            } else {
                setTimeout(() => {
                    setFlipped([]);
                    setDisabled(false);
                }, 700);
            }
        }
    }, [flipped, deck]);

    function handleFlip(index) {
        if (disabled) return;
        if (flipped.includes(index)) return;
        if (deck[index].matched) return;
        if (flipped.length === 0) {
            setFlipped([index]);
            return;
        }
        if (flipped.length === 1) {
            setFlipped([flipped[0], index]);
        }
    }

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm">
            <div
                className={`max-w-4xl w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-6 transition-all duration-600 ease-out`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                            Generating presentation
                        </h3>
                        <p className="text-sm text-gray-500">
                            Presentation is generating — enjoy your moment.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
                            <div className="text-sm text-gray-500">
                                Generating…
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative transition-all duration-300 opacity-100">
                    <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-4">
                        {deck.map((card, idx) => {
                            const isFlipped =
                                flipped.includes(idx) || card.matched;
                            return (
                                <button
                                    key={card.id}
                                    onClick={() => handleFlip(idx)}
                                    disabled={card.matched}
                                    className="relative w-full h-28 perspective"
                                    style={{ perspective: 800 }}
                                >
                                    <div
                                        className={`absolute inset-0 rounded-xl shadow-md transform transition-transform duration-500`}
                                        style={{
                                            transformStyle: "preserve-3d",
                                            transform: isFlipped
                                                ? "rotateY(180deg)"
                                                : "rotateY(0deg)",
                                        }}
                                    >
                                        <div
                                            className="absolute inset-0 flex items-center justify-center rounded-xl"
                                            style={{
                                                backfaceVisibility: "hidden",
                                                transform: "rotateY(0deg)",
                                                background: isFlipped
                                                    ? "linear-gradient(180deg,#eef2ff,#e0e7ff)"
                                                    : "linear-gradient(180deg,#111827,#1f2937)",
                                            }}
                                        >
                                            <div className="text-2xl text-white font-bold">
                                                ?
                                            </div>
                                        </div>

                                        <div
                                            className="absolute inset-0 flex items-center justify-center rounded-xl"
                                            style={{
                                                backfaceVisibility: "hidden",
                                                transform: "rotateY(180deg)",
                                                background:
                                                    "linear-gradient(180deg,#fff,#f8fafc)",
                                            }}
                                        >
                                            <div className="text-3xl">
                                                {card.icon}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Pairs matched:{" "}
                            <span className="font-medium text-gray-800">
                                {matchedCount}/{PAIRS}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setDeck(makeDeck());
                                    setFlipped([]);
                                    setMatchedCount(0);
                                }}
                                className="w-full bg-blue-600 text-white font-semibold rounded-xl px-5 py-2 transition transform duration-150 ease-out active:scale-95 shadow-md shadow-blue-200 hover:shadow-lg"
                            >
                                Shuffle
                            </button>
                        </div>
                    </div>
                </div>

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
                    .perspective button:focus {
                        outline: none;
                    }
                    .perspective > div > div {
                        border-radius: 12px;
                    }
                `}</style>
            </div>
        </div>
    );
}
