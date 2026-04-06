export declare class RagQueryDto {
    query: string;
    topK?: number;
}
export declare class SourceDto {
    documentId: string;
    filename: string;
    chunkId: string;
    content: string;
}
export declare class RagQueryResponseDto {
    answer: string;
    sources: SourceDto[];
}
