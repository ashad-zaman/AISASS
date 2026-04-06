import { Response } from 'express';
import { PrismaService } from '../../config/prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    health(res: Response): void;
    ready(res: Response): Promise<void>;
}
