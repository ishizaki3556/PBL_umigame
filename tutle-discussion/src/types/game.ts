import { Player } from "./player";
import { Problem } from "./problem";

export type QuestionLog = {
    playerId: string;
    question: string;
    answer: string;
    timestamp: number;
};

export type ConversationLog = {
    playerId: string;
    text: string;
    timestamp: number;
};

export type GameState = {
    players: Player[];
    problem: Problem;
    questions: QuestionLog[];
    conversationLogs: ConversationLog[];
    startTime: number;
    timeLimit: number;
    finalAnswer?: string;
    isCorrect?: boolean;
};
