"use client";

import { FormEvent, useEffect, useState } from "react";

type HistoryItem = {
    question: string;
    answer: string;
};

const problemId = "problem001";

export default function Home() {
    const [title, setTitle] = useState("");
    const [problem, setProblem] = useState("");
    const [question, setQuestion] = useState("");
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [answer, setAnswer] = useState("");
    const [showingAnswer, setShowingAnswer] = useState(false);

    const [loadingProblem, setLoadingProblem] = useState(true);
    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [loadingAnswer, setLoadingAnswer] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadProblem() {
            try {
                setLoadingProblem(true);
                setError("");

                const response = await fetch(
                    `/api/problems/${encodeURIComponent(problemId)}`,
                    {
                        cache: "no-store",
                    },
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail ||
                        data.error ||
                        "問題の読み込みに失敗しました。",
                    );
                }

                setTitle(data.title);
                setProblem(data.question);
            } catch (caughtError) {
                console.error("問題読み込みエラー:", caughtError);

                setError(
                    caughtError instanceof Error
                        ? caughtError.message
                        : "問題の読み込みに失敗しました。",
                );
            } finally {
                setLoadingProblem(false);
            }
        }

        loadProblem();
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedQuestion = question.trim();

        if (!trimmedQuestion) {
            setError("質問を入力してください。");
            return;
        }

        try {
            setLoadingQuestion(true);
            setError("");

            const response = await fetch("/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    problemId,
                    question: trimmedQuestion,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "AIとの通信に失敗しました。",
                );
            }

            setHistory((currentHistory) => [
                ...currentHistory,
                {
                    question: trimmedQuestion,
                    answer: data.answer,
                },
            ]);

            setQuestion("");
        } catch (caughtError) {
            console.error("質問処理エラー:", caughtError);

            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "AIとの通信に失敗しました。",
            );
        } finally {
            setLoadingQuestion(false);
        }
    }

    async function handleShowAnswer() {
        try {
            setLoadingAnswer(true);
            setError("");

            const response = await fetch(
                `/api/problems/${problemId}/answer`,
                {
                    cache: "no-store",
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "答えの取得に失敗しました。",
                );
            }

            setAnswer(data.answer);
            setShowingAnswer(true);
        } catch (caughtError) {
            console.error("答え取得エラー:", caughtError);

            setError(
                caughtError instanceof Error
                    ? caughtError.message
                    : "答えの取得に失敗しました。",
            );
        } finally {
            setLoadingAnswer(false);
        }
    }

    function handleNewGame() {
        setQuestion("");
        setHistory([]);
        setAnswer("");
        setShowingAnswer(false);
        setError("");
    }

    return (
        <main className="page">
            <section className="game-container">
                <header className="header">
                    <div>
                        <p className="eyebrow">YES / NO MYSTERY</p>

                        <h1>ウミガメのスープ</h1>

                        <p className="subtitle">
                            AIゲームマスターに質問して、謎を解き明かそう
                        </p>
                    </div>

                    <div className="header-icon">?</div>
                </header>

                <section className="problem-card">
                    <div className="section-heading">
                        <span className="section-number">01</span>
                        <h2>{loadingProblem ? "読み込み中..." : title}</h2>
                    </div>

                    <div className="problem-text">
                        {loadingProblem
                            ? "問題を読み込んでいます..."
                            : problem}
                    </div>
                </section>

                <section className="question-card">
                    <div className="section-heading">
                        <span className="section-number">02</span>
                        <h2>質問する</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="question-row">
                            <input
                                className="question-input"
                                type="text"
                                value={question}
                                onChange={(event) =>
                                    setQuestion(event.target.value)
                                }
                                placeholder="質問を入力してください"
                                disabled={
                                    loadingProblem ||
                                    loadingQuestion ||
                                    showingAnswer
                                }
                            />

                            <button
                                className="ask-button"
                                type="submit"
                                disabled={
                                    loadingProblem ||
                                    loadingQuestion ||
                                    showingAnswer
                                }
                            >
                                {loadingQuestion ? "確認中..." : "質問する"}
                            </button>
                        </div>
                    </form>

                    {error && <p className="error-message">{error}</p>}

                    <div className="answer-guide">
                        回答：
                        <span className="guide-item yes">はい</span>
                        <span className="guide-item no">いいえ</span>
                        <span className="guide-item other">
                            関係ありません
                        </span>
                    </div>
                </section>

                <section className="history-card">
                    <div className="section-heading history-heading">
                        <div className="heading-title">
                            <span className="section-number">03</span>
                            <h2>質問履歴</h2>
                        </div>

                        <span className="question-count">
                            {history.length} QUESTIONS
                        </span>
                    </div>

                    {history.length === 0 ? (
                        <div className="empty-history">
                            <div className="empty-icon">?</div>
                            <p>まだ質問がありません</p>
                            <span>問題について質問してみましょう</span>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((item, index) => (
                                <div
                                    className="history-item"
                                    key={`${item.question}-${index}`}
                                >
                                    <div className="history-index">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>

                                    <div className="history-content">
                                        <p className="history-question">
                                            {item.question}
                                        </p>

                                        <p className="history-answer">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="answer-section">
                    {!showingAnswer ? (
                        <button
                            className="show-answer-button"
                            type="button"
                            onClick={handleShowAnswer}
                            disabled={
                                loadingProblem ||
                                loadingAnswer ||
                                history.length === 0
                            }
                        >
                            {loadingAnswer ? "答えを取得中..." : "答えを見る"}
                        </button>
                    ) : (
                        <div className="answer-box">
                            <div className="section-heading">
                                <span className="section-number">04</span>
                                <h2>真相</h2>
                            </div>

                            <p>{answer}</p>
                        </div>
                    )}
                </section>

                <div className="action-area">
                    <button
                        className="secondary-button"
                        type="button"
                        onClick={handleNewGame}
                    >
                        ↻ 新しいゲーム
                    </button>
                </div>
            </section>
        </main>
    );
}