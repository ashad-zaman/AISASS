export declare class ChatRequestDto {
    threadId?: string;
    message: string;
    systemPrompt?: string;
    model?: string;
}
export declare class ChatResponseDto {
    id: string;
    threadId: string;
    message: string;
    response: string;
    tokenUsage: number;
    model: string;
}
export declare class ThreadDto {
    id: string;
    title: string;
    model: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
}
export declare class MessageDto {
    id: string;
    role: string;
    content: string;
    tokenUsage: number;
    createdAt: Date;
}
