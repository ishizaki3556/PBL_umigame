"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const PLAYER_COUNT = 4;

export default function PlayerRegistration() {
    const router = useRouter();

    const [names, setNames] = useState<string[]>(
        Array.from({ length: PLAYER_COUNT }, () => ""),
    );

    const [error, setError] = useState("");

    const updateName = (index: number, value: string) => {
        const nextNames = [...names];
        nextNames[index] = value;
        setNames(nextNames);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        const trimmedNames = names.map((name) => name.trim());

        if (trimmedNames.some((name) => name.length === 0)) {
            setError("4人全員の名前を入力してください。");
            return;
        }

        if (trimmedNames.some((name) => name.length > 20)) {
            setError("名前は20文字以内で入力してください。");
            return;
        }

        const normalizedNames = trimmedNames.map((name) => name.toLowerCase());
        const hasDuplicate = new Set(normalizedNames).size !== normalizedNames.length;

        if (hasDuplicate) {
            setError("同じ名前は使用できません。");
            return;
        }

        const params = new URLSearchParams();

        trimmedNames.forEach((name, index) => {
            params.set(`player${index + 1}`, name);
        });

        router.push(`/game?${params.toString()}`);
    };

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-10">
            <div className="mx-auto max-w-2xl">
                <section className="rounded-3xl bg-white p-6 shadow-lg sm:p-10">
                    <div className="mb-8 text-center">
                        <p className="mb-2 text-sm font-semibold tracking-widest text-teal-600">
                            TURTLE DISCUSSION
                        </p>

                        <h1 className="text-3xl font-bold text-slate-900">
                            プレイヤー登録
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            4人で遊ぶため、順番にプレイヤー名を入力してください。
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {names.map((name, index) => (
                            <div key={`player-${index}`}>
                                <label
                                    htmlFor={`player-${index}`}
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    プレイヤー {index + 1}
                                </label>

                                <input
                                    id={`player-${index}`}
                                    type="text"
                                    value={name}
                                    onChange={(event) => {
                                        updateName(index, event.target.value);
                                    }}
                                    maxLength={20}
                                    placeholder={`プレイヤー${index + 1}の名前`}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                                />
                            </div>
                        ))}

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700 active:scale-[0.99]"
                        >
                            ゲームを開始する
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
