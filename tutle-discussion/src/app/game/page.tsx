"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
    type: "question" | "answer";
    text: string;
};

export default function GamePage() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function askQuestion() {
        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || isLoading) {
            return;
        }

        setError("");
        setIsLoading(true);

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                type: "question",
                text: trimmedQuestion,
            },
        ]);

        setQuestion("");

        try {
            const response = await fetch("/api/ask", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: trimmedQuestion,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "回答の取得に失敗しました。");
            }

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    type: "answer",
                    text: data.answer,
                },
            ]);
        } catch (requestError) {
            const message =
                requestError instanceof Error
                    ? requestError.message
                    : "回答の取得に失敗しました。";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-widest text-teal-600">
                            TURTLE DISCUSSION
                        </p>

                        <h1 className="text-3xl font-bold text-slate-900">
                            ウミガメのスープ
                        </h1>
                    </div>

                    <Link
                        href="/"
                        className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow"
                    >
                        トップへ
                    </Link>
                </header>

                <section className="rounded-3xl bg-white p-6 shadow-lg">
                    <div className="mb-6 rounded-2xl bg-teal-50 p-5">
                        <h2 className="mb-2 text-xl font-bold text-slate-900">
                            問題文
                        </h2>

                        <p className="leading-7 text-slate-700">
                            ある男がレストランでウミガメのスープを注文しました。
                            一口飲んだ男は、店員にお金を払い、店を出たあと自殺しました。
                            なぜでしょうか？
                        </p>
                    </div>

                    <div className="mb-6 space-y-3">
                        {messages.length === 0 && !isLoading ? (
                            <p className="text-center text-sm text-slate-400">
                                問題文について質問してください
                            </p>
                        ) : (
                            messages.map((message, index) => (
                                <div
                                    key={`${message.type}-${index}`}
                                    className={
                                        message.type === "question"
                                            ? "ml-8 rounded-xl bg-slate-100 p-4 text-slate-700"
                                            : "mr-8 rounded-xl bg-teal-50 p-4 text-slate-700"
                                    }
                                >
                                    <p className="mb-1 text-xs font-bold text-slate-400">
                                        {message.type === "question" ? "あなたの質問" : "ゲームマスター"}
                                    </p>

                                    <p className="leading-7">{message.text}</p>
                                </div>
                            ))
                        )}

                        {isLoading && (
                            <div className="mr-8 rounded-xl bg-teal-50 p-4 text-slate-500">
                                ゲームマスターが考えています…
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    askQuestion();
                                }
                            }}
                            disabled={isLoading}
                            placeholder="例：男はスープを飲んだことがありますか？"
                            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 disabled:bg-slate-100"
                        />

                        <button
                            onClick={askQuestion}
                            disabled={isLoading || !question.trim()}
                            className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                            {isLoading ? "送信中…" : "質問する"}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/result"
                            className="text-sm font-semibold text-teal-700 underline"
                        >
                            結果画面へ進む
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}