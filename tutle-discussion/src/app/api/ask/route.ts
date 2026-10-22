import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Problem = {
    id: string;
    title: string;
    question: string;
    answer: string;
};

type AskRequest = {
    problemId: string;
    question: string;
};

type AnthropicResponse = {
    content?: Array<{
        type: string;
        text?: string;
    }>;
    error?: {
        type?: string;
        message?: string;
    };
};

// 回答を3種類に正規化する
function normalizeAnswer(text: string): string {
    const normalized = text
        .replace(/\s/g, "")
        .replace(/[。．,.、！!？?「」『』""]/g, "")
        .trim()
        .toLowerCase();

    // 「はい」で始まる場合
    if (
        normalized.startsWith("はい") ||
        normalized.includes("はい")
    ) {
        return "はい";
    }

    // 「いいえ」で始まる場合
    if (
        normalized.startsWith("いいえ") ||
        normalized.includes("いいえ")
    ) {
        return "いいえ";
    }

    // それ以外は「関係ありません」
    return "関係ありません";
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as AskRequest;

        console.log("[API] Request body:", body);

        if (!body.problemId || !body.question?.trim()) {
            return NextResponse.json(
                {
                    error: "問題IDと質問を入力してください。",
                },
                {
                    status: 400,
                },
            );
        }

        const filePath = path.join(
            process.cwd(),
            "src",
            "data",
            "problems",
            `${body.problemId}.json`,
        );

        const file = await fs.readFile(filePath, "utf8");
        const problem = JSON.parse(file) as Problem;

        const apiKey = process.env.ANTHROPIC_API_KEY;
        const model =
            process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

        console.log("[API] Model:", model);
        console.log("[API] Question:", body.question);

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "ANTHROPIC_API_KEYが設定されていません。.env.localを確認してください。",
                },
                {
                    status: 500,
                },
            );
        }

        console.log("[API] Sending request to Anthropic...");

        const anthropicResponse = await fetch(
            "https://api.anthropic.com/v1/messages",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                    model,
                    max_tokens: 30,
                    system: `
あなたはウミガメのスープのゲームマスターです。

【問題】
${problem.question}

【真相】
${problem.answer}

【ルール】
プレイヤーの質問に対して、次の3つのうち必ず1つだけを返してください。

はい
いいえ
関係ありません

重要：
- 上記3つ以外の言葉を絶対に出力しないでください
- 説明、理由、句読点、改行を付けないでください
- 「はいです」「答えははい」のような言い方もしないでください
- 3つのうち1つだけを返してください
`.trim(),
                    messages: [
                        {
                            role: "user",
                            content: body.question.trim(),
                        },
                    ],
                }),
            },
        );

        console.log("[API] Response status:", anthropicResponse.status);

        const data =
            (await anthropicResponse.json()) as AnthropicResponse;

        console.log("[API] Response data:", JSON.stringify(data, null, 2));

        if (!anthropicResponse.ok) {
            console.error("[API] Anthropic error:", data);

            return NextResponse.json(
                {
                    error:
                        data.error?.message ||
                        "Anthropicから回答を取得できませんでした。",
                },
                {
                    status: 500,
                },
            );
        }

        const rawAnswer = data.content
            ?.filter((item) => item.type === "text")
            .map((item) => item.text || "")
            .join("")
            .trim();

        console.log("[API] Raw answer:", rawAnswer);

        if (!rawAnswer) {
            console.error("[API] Empty answer from Anthropic");
            return NextResponse.json(
                {
                    error: "Anthropicの回答が空でした。",
                },
                {
                    status: 500,
                },
            );
        }

        // ここが重要：回答を3種類に正規化する
        const normalizedAnswer = normalizeAnswer(rawAnswer);

        console.log("[API] Normalized answer:", normalizedAnswer);

        return NextResponse.json({
            answer: normalizedAnswer,
        });
    } catch (error) {
        console.error("[API] Error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "質問の処理に失敗しました。",
            },
            {
                status: 500,
            },
        );
    }
}