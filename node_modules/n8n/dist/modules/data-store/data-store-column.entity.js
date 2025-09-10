"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStoreColumn = void 0;
const db_1 = require("@n8n/db");
const typeorm_1 = require("@n8n/typeorm");
let DataStoreColumn = class DataStoreColumn extends db_1.WithTimestampsAndStringId {
};
exports.DataStoreColumn = DataStoreColumn;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DataStoreColumn.prototype, "dataStoreId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DataStoreColumn.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], DataStoreColumn.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], DataStoreColumn.prototype, "index", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('DataStore', 'columns'),
    (0, typeorm_1.JoinColumn)({ name: 'dataStoreId' }),
    __metadata("design:type", Function)
], DataStoreColumn.prototype, "dataStore", void 0);
exports.DataStoreColumn = DataStoreColumn = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(['dataStoreId', 'name'], { unique: true })
], DataStoreColumn);
//# sourceMappingURL=data-store-column.entity.js.map