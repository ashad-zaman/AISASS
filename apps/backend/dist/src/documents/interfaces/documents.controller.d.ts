import { DocumentsService, DocumentResponse } from '../application/documents.service';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(user: CurrentUserPayload, file: Express.Multer.File): Promise<DocumentResponse>;
    list(user: CurrentUserPayload): Promise<DocumentResponse[]>;
    get(user: CurrentUserPayload, id: string): Promise<DocumentResponse>;
    delete(user: CurrentUserPayload, id: string): Promise<void>;
}
