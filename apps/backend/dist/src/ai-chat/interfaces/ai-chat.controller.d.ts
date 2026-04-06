import { AiChatService } from '../application/ai-chat.service';
import { ChatRequestDto, ChatResponseDto, ThreadDto, MessageDto } from '../application/ai-chat.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class AiChatController {
    private readonly aiChatService;
    constructor(aiChatService: AiChatService);
    chat(user: CurrentUserPayload, dto: ChatRequestDto): Promise<ChatResponseDto>;
    listThreads(user: CurrentUserPayload): Promise<ThreadDto[]>;
    getMessages(user: CurrentUserPayload, threadId: string): Promise<MessageDto[]>;
}
