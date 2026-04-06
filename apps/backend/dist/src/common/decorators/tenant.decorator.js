"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = exports.TENANT_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.TENANT_KEY = 'tenant';
const Tenant = () => (0, common_1.SetMetadata)(exports.TENANT_KEY, true);
exports.Tenant = Tenant;
//# sourceMappingURL=tenant.decorator.js.map