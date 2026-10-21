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

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as AskRequest;

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
                    max_tokens: 300,
                    system: `
あなたはウミガメのスープのゲームマスターです。

以下の問題について、プレイヤーの質問に回答してください。

問題:
${problem.question}

真相:
${problem.answer}

回答ルール:
- 真相を直接すべて説明してはいけません。
- 質問への回答は、基本的に「はい」「いいえ」「関係ありません」のいずれかで始めてください。
- 必要に応じて、短い補足説明を1文だけ付けてください。
- 日本語で回答してください。
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

        const data =
            (await anthropicResponse.json()) as AnthropicResponse;

        if (!anthropicResponse.ok) {
            console.error("Anthropic APIエラー:", data);

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

        const answer = data.content
            ?.filter((item) => item.type === "text")
            .map((item) => item.text || "")
            .join("")
            .trim();

        if (!answer) {
            return NextResponse.json(
                {
                    error: "Anthropicの回答が空でした。",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            answer,
        });
    } catch (error) {
        console.error("質問処理に失敗しました:", error);

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