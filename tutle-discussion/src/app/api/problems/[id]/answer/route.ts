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

        if (!problem.answer) {
            return NextResponse.json(
                {
                    error: "答えが登録されていません。",
                },
                {
                    status: 500,
                },
            );
        }

        return NextResponse.json({
            answer: problem.answer,
        });
    } catch (error) {
        console.error("答えの読み込みに失敗しました:", error);

        return NextResponse.json(
            {
                error: "答えが見つかりません。",
                detail:
                    error instanceof Error ? error.message : String(error),
            },
            {
                status: 404,
            },
        );
    }
}