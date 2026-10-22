import type { Player } from "./player";

export type GameLog = {
    id: string;
    players: Player[];
    problemId: string;
    questions: Array<{
        playerName: string;
        question: string;
        answer: string;
    }>;
    finalAnswer: string;
    isCorrect: boolean;
    timestamp: number;
    durationMs: number;
};

export type PlayerStat = {
    playerId: string;
    playerName: string;
    questionsAsked: number;
    conversationCount: number;
};
