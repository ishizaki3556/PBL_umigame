import type { Problem } from "../types/problem";

export function createMockAnswer(
    question: string,
    _problem: Problem,
): string {
    const normalizedQuestion = question
        .toLowerCase()
        .replace(/\s/g, "");

    if (
        normalizedQuestion.includes("しゃっくり") ||
        normalizedQuestion.includes("しゃくり")
    ) {
        return "はい。男はしゃっくりをしていました。";
    }

    if (
        normalizedQuestion.includes("水") ||
        normalizedQuestion.includes("みず")
    ) {
        return "いいえ。男が水を注文したことには、別の理由があります。";
    }

    if (
        normalizedQuestion.includes("銃") ||
        normalizedQuestion.includes("拳銃") ||
        normalizedQuestion.includes("ピストル")
    ) {
        return "はい。店員は男に銃を向けました。ただし、脅すことが目的ではありません。";
    }

    if (
        normalizedQuestion.includes("撃") ||
        normalizedQuestion.includes("打")
    ) {
        return "いいえ。店員は男を撃っていません。";
    }

    if (
        normalizedQuestion.includes("驚") ||
        normalizedQuestion.includes("おどろ")
    ) {
        return "はい。店員の行動によって、男は驚きました。";
    }

    if (
        normalizedQuestion.includes("病気") ||
        normalizedQuestion.includes("具合")
    ) {
        return "いいえ。病気が直接の原因ではありません。";
    }

    return "どちらとも言えません。別の角度から質問してみてください。";
}