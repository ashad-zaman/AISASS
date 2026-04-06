"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = exports.ENTITY_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ENTITY_KEY = 'entity';
const Entity = () => (0, common_1.SetMetadata)(exports.ENTITY_KEY, true);
exports.Entity = Entity;
//# sourceMappingURL=entity.decorator.js.map