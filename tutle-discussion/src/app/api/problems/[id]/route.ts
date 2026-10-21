import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Problem = {
    id: string;
    title: string;
    question: string;
    answer: string;
};

export async function GET(
    _request: Request,
    context: {
        params: Promise<{ id: string }>;
    },
) {
    try {
        const { id } = await context.params;

        const filePath = path.join(
            process.cwd(),
            "src",
            "data",
            "problems",
            `${id}.json`,
        );

        const file = await fs.readFile(filePath, "utf8");
        const problem = JSON.parse(file) as Problem;

        if (!problem.id || !problem.title || !problem.question) {
            return NextResponse.json(
                {
                    error: "問題データの項目が不足しています。",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            id: problem.id,
            title: problem.title,
            question: problem.question,
        });
    } catch (error) {
        console.error("問題の読み込みに失敗しました:", error);

        return NextResponse.json(
            {
                error: "問題が見つかりません。",
                detail:
                    error instanceof Error ? error.message : String(error),
            },
            {
                status: 404,
            },
        );
    }
}