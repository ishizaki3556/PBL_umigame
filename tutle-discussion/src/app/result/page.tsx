import Link from "next/link";

export default function ResultPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-lg">
                <p className="text-sm font-semibold tracking-widest text-teal-600">
                    GAME RESULT
                </p>

                <h1 className="mt-3 text-3xl font-bold text-slate-900">
                    ゲーム結果
                </h1>

                <div className="mt-8 rounded-2xl bg-teal-50 p-6">
                    <p className="text-sm text-slate-500">正解</p>
                    <p className="mt-2 text-2xl font-bold text-teal-700">
                        クリア
                    </p>
                </div>

                <p className="mt-6 leading-7 text-slate-600">
                    みんなで協力して問題に挑戦しました。
                    <br />
                    お疲れさまでした。
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link
                        href="/game"
                        className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
                    >
                        もう一度遊ぶ
                    </Link>

                    <Link
                        href="/"
                        className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-300"
                    >
                        トップへ戻る
                    </Link>
                </div>
            </section>
        </main>
    );
}
