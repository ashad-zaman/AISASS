export declare class UsageStatDto {
    used: number;
    limit: number;
}
export declare class UsageResponseDto {
    requests: UsageStatDto;
    tokens: UsageStatDto;
    documents: UsageStatDto;
}
