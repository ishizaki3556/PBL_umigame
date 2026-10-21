import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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
        const problem: Problem = JSON.parse(file);

        // answerは絶対に返さない
        return NextResponse.json({
            id: problem.id,
            title: problem.title,
            question: problem.question,
        });
    } catch {
        return NextResponse.json(
            {
                error: "問題が見つかりません。",
            },
            {
                status: 404,
            },
        );
    }
}