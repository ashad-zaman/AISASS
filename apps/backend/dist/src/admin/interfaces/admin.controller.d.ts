import { AdminService } from '../application/admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<import("../application/admin.service").AdminStats>;
    getFailedDocuments(limit?: number): Promise<import("../application/admin.service").FailedJob[]>;
    getRecentJobs(limit?: number): Promise<any[]>;
    getTenants(limit?: number, offset?: number): Promise<any[]>;
}
