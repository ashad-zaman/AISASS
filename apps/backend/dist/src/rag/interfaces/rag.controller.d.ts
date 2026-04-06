import { RagService } from '../application/rag.service';
import { RagQueryDto, RagQueryResponseDto } from '../application/rag.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class RagController {
    private readonly ragService;
    constructor(ragService: RagService);
    query(user: CurrentUserPayload, dto: RagQueryDto): Promise<RagQueryResponseDto>;
}
