import React, { useEffect, useMemo, useState } from "react";
import { getCookie, getCsrfToken } from "../utils/csrf";

const PAIRS = 8;
const PREVIEW_MS = 300;
const HINT_MS = 500;
const ICONS = [
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
];

function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function makeDeck() {
    return shuffle(
        shuffle(ICONS).slice(0, PAIRS).flatMap((icon, id) => [
            { id: `${icon}-${id}-a`, icon, matched: false },
            { id: `${icon}-${id}-b`, icon, matched: false },
        ])
    );
}

function calcFinalScore(baseScore, seconds, moves, hintUsed) {
    const timeBonus = Math.max(0, 180 - seconds) * 4;
    const timePenalty = Math.max(0, seconds - 180) * 2;
    const movePenalty = Math.max(0, moves - 8) * 5;
    const hintPenalty = hintUsed ? 35 : 0;
    return Math.max(
        0,
        baseScore + timeBonus - timePenalty - movePenalty - hintPenalty
    );
}

export default function MiniLoaderMemo({
    isOpen = false,
    isGenerating = false,
    status = "idle",
    statusMessage = "",
    isMemoOnlyMode = false,
    onClose = () => {},
    onDownload = null,
}) {
    const [deck, setDeck] = useState(() => makeDeck());
    const [flipped, setFlipped] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [matchedCount, setMatchedCount] = useState(0);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [previewing, setPreviewing] = useState(true);
    const [peekActive, setPeekActive] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [scoreSubmitted, setScoreSubmitted] = useState(false);
    const [submittedScore, setSubmittedScore] = useState(null);
    const [showTopTen, setShowTopTen] = useState(false);

    const completed = matchedCount === PAIRS;
    const finalScore = useMemo(
        () => calcFinalScore(score, elapsed, moves || PAIRS, hintUsed),
        [score, elapsed, moves, hintUsed]
    );
    const topThree = useMemo(() => leaderboard.slice(0, 3), [leaderboard]);
    const progress = useMemo(
        () => Math.round((matchedCount / PAIRS) * 100),
        [matchedCount]
    );
    const accuracy = useMemo(
        () => (moves ? Math.round((matchedCount / moves) * 100) : 100),
        [matchedCount, moves]
    );
    const statusText =
        status === "success"
            ? statusMessage || "Presentation is ready."
            : status === "error"
              ? statusMessage || "Something went wrong."
              : completed
                ? "Board cleared. Nice."
                : previewing
                  ? "Preview the board before cards hide."
                  : streak > 1
                    ? `${streak} match streak.`
                    : "Match pairs while presentation generates.";

    useEffect(() => {
        if (!isOpen) return;
        setDeck(makeDeck());
        setFlipped([]);
        setDisabled(false);
        setMatchedCount(0);
        setMoves(0);
        setScore(0);
        setStreak(0);
        setElapsed(0);
        setPeekActive(false);
        setHintUsed(false);
        setScoreSubmitted(false);
        setSubmittedScore(null);
        setShowTopTen(false);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        let cancelled = false;
        const loadLeaderboard = async () => {
            setLeaderboardLoading(true);
            try {
                const res = await fetch("/api/memo-leaderboard", {
                    headers: { Accept: "application/json" },
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to load leaderboard");
                const data = await res.json();
                if (!cancelled) setLeaderboard(Array.isArray(data.rows) ? data.rows : []);
            } catch (_) {
                if (!cancelled) setLeaderboard([]);
            } finally {
                if (!cancelled) setLeaderboardLoading(false);
            }
        };
        loadLeaderboard();
        return () => {
            cancelled = true;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setPreviewing(true);
        const timeout = setTimeout(() => setPreviewing(false), PREVIEW_MS);
        return () => clearTimeout(timeout);
    }, [deck, isOpen]);

    useEffect(() => {
        if (!isOpen || completed) return;
        const interval = setInterval(() => {
            setElapsed((value) => value + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [completed, isOpen]);

    useEffect(() => {
        if (flipped.length !== 2) return;
        setDisabled(true);
        const [a, b] = flipped;
        const match = deck[a].icon === deck[b].icon;
        const timeout = setTimeout(() => {
            setMoves((value) => value + 1);

            if (match) {
                setDeck((cards) =>
                    cards.map((card, index) =>
                        index === a || index === b
                            ? { ...card, matched: true }
                            : card
                    )
                );
                setMatchedCount((value) => value + 1);
                setScore((value) => value + 120 + streak * 35);
                setStreak((value) => value + 1);
            } else {
                setScore((value) => Math.max(0, value - 15));
                setStreak(0);
            }

            setFlipped([]);
            setDisabled(false);
        }, match ? 360 : 760);

        return () => clearTimeout(timeout);
    }, [deck, flipped, streak]);

    function resetGame() {
        setDeck(makeDeck());
        setFlipped([]);
        setDisabled(false);
        setMatchedCount(0);
        setMoves(0);
        setScore(0);
        setStreak(0);
        setElapsed(0);
        setPeekActive(false);
        setHintUsed(false);
        setScoreSubmitted(false);
        setSubmittedScore(null);
        setShowTopTen(false);
    }

    function handleFlip(index) {
        if (disabled || previewing || peekActive || completed) return;
        if (flipped.includes(index) || deck[index].matched) return;
        if (flipped.length === 0) {
            setFlipped([index]);
            return;
        }
        if (flipped.length === 1) setFlipped([flipped[0], index]);
    }

    function handleHint() {
        if (hintUsed || disabled || previewing || completed || flipped.length)
            return;
        setHintUsed(true);
        setPeekActive(true);
        setDisabled(true);
        setTimeout(() => {
            setPeekActive(false);
            setDisabled(false);
        }, HINT_MS);
    }

    useEffect(() => {
        if (!isOpen || !completed || scoreSubmitted) return;
        let cancelled = false;
        const submitScore = async () => {
            try {
                await getCsrfToken();
                const xsrfToken = decodeURIComponent(
                    getCookie("XSRF-TOKEN") || ""
                );
                const res = await fetch("/api/memo-leaderboard", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-XSRF-TOKEN": xsrfToken,
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        base_score: score,
                        completion_seconds: elapsed || 1,
                        moves: moves || PAIRS,
                        hint_used: hintUsed,
                    }),
                });
                if (!res.ok) throw new Error("Failed to submit score");
                const data = await res.json();
                if (cancelled) return;
                if (typeof data.score === "number") setSubmittedScore(data.score);
                setLeaderboard(Array.isArray(data.rows) ? data.rows : []);
                setScoreSubmitted(true);
            } catch (_) {
                if (!cancelled) setScoreSubmitted(true);
            }
        };
        submitScore();
        return () => {
            cancelled = true;
        };
    }, [completed, elapsed, hintUsed, isOpen, moves, score, scoreSubmitted]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/35 p-3 backdrop-blur-[2px] sm:p-4">
            <div className="mx-auto flex min-h-full max-w-5xl items-start justify-center sm:items-center">
                <div className="my-2 w-full max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-300/50 sm:my-0 sm:overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                {isMemoOnlyMode
                                    ? "Memo game"
                                    : "Generating presentation"}
                            </h3>
                            <p className="text-xs text-slate-500 sm:text-sm">
                                {statusText}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                            Close
                        </button>
                    </div>

                    {completed ? (
                        <div className="space-y-4 p-4 sm:p-5">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
                                <div className="text-4xl">🎉</div>
                                <h4 className="mt-2 text-2xl font-bold text-emerald-700">
                                    Congradulations!
                                </h4>
                                <p className="mt-1 text-sm text-emerald-700/90">
                                    You matched all pairs.
                                </p>
                                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                                    <div className="rounded-xl border border-emerald-200 bg-white p-2">
                                        <div className="text-emerald-600">
                                            Score
                                        </div>
                                        <div className="font-bold text-slate-900">
                                            {submittedScore ?? finalScore}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-emerald-200 bg-white p-2">
                                        <div className="text-emerald-600">
                                            Time
                                        </div>
                                        <div className="font-bold text-slate-900">
                                            {elapsed}s
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-emerald-200 bg-white p-2">
                                        <div className="text-emerald-600">
                                            Moves
                                        </div>
                                        <div className="font-bold text-slate-900">
                                            {moves}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={resetGame}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Play again
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow shadow-blue-200"
                                    >
                                        Close game
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="mb-2 text-sm font-semibold text-slate-800">
                                    Leaderboard
                                </div>
                                {leaderboardLoading ? (
                                    <div className="text-xs text-slate-500">
                                        Loading...
                                    </div>
                                ) : topThree.length ? (
                                    <div className="space-y-2">
                                        {topThree.map((row, index) => (
                                            <div
                                                key={row.id}
                                                className="flex items-center justify-between rounded-lg border border-slate-100 px-2 py-1.5 text-xs"
                                            >
                                                <div className="truncate pr-2">
                                                    <span className="font-semibold text-slate-700">
                                                        #{index + 1}
                                                    </span>{" "}
                                                    <span className="text-slate-900">
                                                        {row.name}
                                                    </span>
                                                </div>
                                                <div className="text-slate-700">
                                                    {row.score} · {row.completion_seconds}s
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-slate-500">
                                        No scores yet.
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowTopTen(true)}
                                    className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    See top 10
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
                                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                                    {deck.map((card, idx) => {
                                        const isFlipped =
                                            previewing ||
                                            peekActive ||
                                            flipped.includes(idx) ||
                                            card.matched;
                                        return (
                                            <button
                                                key={card.id}
                                                type="button"
                                                aria-label={`Flip card ${idx + 1}`}
                                                onClick={() => handleFlip(idx)}
                                                disabled={card.matched || completed}
                                                className="group relative h-[68px] w-full sm:h-[78px] md:h-[88px]"
                                                style={{ perspective: 800 }}
                                            >
                                                <div
                                                    className="absolute inset-0 transition-transform duration-500"
                                                    style={{
                                                        transformStyle:
                                                            "preserve-3d",
                                                        transform: isFlipped
                                                            ? "rotateY(180deg)"
                                                            : "rotateY(0deg)",
                                                    }}
                                                >
                                                    <div
                                                        className="absolute inset-0 flex items-center justify-center rounded-xl border border-slate-300 bg-white text-xl font-bold text-slate-700 shadow-sm"
                                                        style={{
                                                            backfaceVisibility:
                                                                "hidden",
                                                        }}
                                                    >
                                                        ?
                                                    </div>
                                                    <div
                                                        className={`absolute inset-0 flex items-center justify-center rounded-xl border shadow-sm ${
                                                            card.matched
                                                                ? "border-emerald-300 bg-emerald-50"
                                                                : "border-blue-200 bg-blue-50"
                                                        }`}
                                                        style={{
                                                            backfaceVisibility:
                                                                "hidden",
                                                            transform:
                                                                "rotateY(180deg)",
                                                        }}
                                                    >
                                                        <span className="text-2xl sm:text-3xl">
                                                            {card.icon}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs text-slate-500">
                                            Base score
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {score}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs text-slate-500">
                                            Time
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {elapsed}s
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs text-slate-500">
                                            Moves
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {moves}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <div className="text-xs text-slate-500">
                                            Matched
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">
                                            {matchedCount}/{PAIRS}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
                                    <div className="text-xs text-slate-500">
                                        Final score (time impact)
                                    </div>
                                    <div className="text-lg font-bold text-slate-900">
                                        {finalScore}
                                    </div>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div
                                    className={`rounded-xl border px-3 py-2 text-xs ${
                                        status === "error"
                                            ? "border-rose-200 bg-rose-50 text-rose-700"
                                            : status === "success"
                                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                              : "border-blue-200 bg-blue-50 text-blue-700"
                                    }`}
                                >
                                    {isGenerating
                                        ? "Generating in progress..."
                                        : status === "success"
                                          ? "Generation completed."
                                          : status === "error"
                                            ? "Generation failed."
                                            : "Generation not started."}
                                </div>

                                <div className="grid gap-2">
                                    <button
                                        type="button"
                                        onClick={handleHint}
                                        disabled={
                                            hintUsed ||
                                            disabled ||
                                            previewing ||
                                            completed ||
                                            flipped.length > 0
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {hintUsed ? "Hint used" : "Reveal all"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetGame}
                                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        New board
                                    </button>
                                    {onDownload && status === "success" && (
                                        <button
                                            type="button"
                                            onClick={onDownload}
                                            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow shadow-blue-200"
                                        >
                                            Download
                                        </button>
                                    )}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="mb-2 text-xs font-semibold text-slate-700">
                                        Leaderboard
                                    </div>
                                    {leaderboardLoading ? (
                                        <div className="text-xs text-slate-500">
                                            Loading...
                                        </div>
                                    ) : topThree.length ? (
                                        <div className="space-y-1.5">
                                            {topThree.map((row, index) => (
                                                <div
                                                    key={row.id}
                                                    className="flex items-center justify-between text-xs text-slate-700"
                                                >
                                                    <div className="truncate pr-2">
                                                        #{index + 1} {row.name}
                                                    </div>
                                                    <div>
                                                        {row.score} ({row.completion_seconds}s)
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-500">
                                            No scores yet.
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowTopTen(true)}
                                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                    >
                                        See top 10
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showTopTen && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900">
                                Top 10 leaderboard
                            </h4>
                            <button
                                type="button"
                                onClick={() => setShowTopTen(false)}
                                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                Close
                            </button>
                        </div>
                        <div className="max-h-[55vh] space-y-1.5 overflow-y-auto">
                            {leaderboard.length ? (
                                leaderboard.map((row, index) => (
                                    <div
                                        key={`top10-${row.id}`}
                                        className="flex items-center justify-between rounded-lg border border-slate-100 px-2 py-1.5 text-xs text-slate-700"
                                    >
                                        <div className="truncate pr-2">
                                            #{index + 1} {row.name}
                                        </div>
                                        <div>
                                            {row.score} ({row.completion_seconds}s)
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-slate-500">
                                    No scores yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
