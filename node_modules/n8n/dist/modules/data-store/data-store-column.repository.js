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
exports.DataStoreColumnRepository = void 0;
const di_1 = require("@n8n/di");
const typeorm_1 = require("@n8n/typeorm");
const n8n_workflow_1 = require("n8n-workflow");
const data_store_column_entity_1 = require("./data-store-column.entity");
const data_store_rows_repository_1 = require("./data-store-rows.repository");
const data_store_column_name_conflict_error_1 = require("./errors/data-store-column-name-conflict.error");
const data_store_validation_error_1 = require("./errors/data-store-validation.error");
let DataStoreColumnRepository = class DataStoreColumnRepository extends typeorm_1.Repository {
    constructor(dataSource, dataStoreRowsRepository) {
        super(data_store_column_entity_1.DataStoreColumn, dataSource.manager);
        this.dataStoreRowsRepository = dataStoreRowsRepository;
    }
    async getColumns(rawDataStoreId, em) {
        const executor = em ?? this.manager;
        const columns = await executor
            .createQueryBuilder(data_store_column_entity_1.DataStoreColumn, 'dsc')
            .where('dsc.dataStoreId = :dataStoreId', { dataStoreId: rawDataStoreId })
            .getMany();
        columns.sort((a, b) => a.index - b.index);
        return columns;
    }
    async addColumn(dataStoreId, schema) {
        return await this.manager.transaction(async (em) => {
            const existingColumnMatch = await em.existsBy(data_store_column_entity_1.DataStoreColumn, {
                name: schema.name,
                dataStoreId,
            });
            if (existingColumnMatch) {
                throw new data_store_column_name_conflict_error_1.DataStoreColumnNameConflictError(schema.name, dataStoreId);
            }
            if (schema.index === undefined) {
                const columns = await this.getColumns(dataStoreId, em);
                schema.index = columns.length;
            }
            else {
                await this.shiftColumns(dataStoreId, schema.index, 1, em);
            }
            const column = em.create(data_store_column_entity_1.DataStoreColumn, {
                ...schema,
                dataStoreId,
            });
            await em.insert(data_store_column_entity_1.DataStoreColumn, column);
            const queryRunner = em.queryRunner;
            if (!queryRunner) {
                throw new n8n_workflow_1.UnexpectedError('QueryRunner is not available');
            }
            await this.dataStoreRowsRepository.addColumn(dataStoreId, column, queryRunner, em.connection.options.type);
            return column;
        });
    }
    async deleteColumn(dataStoreId, column) {
        await this.manager.transaction(async (em) => {
            await em.remove(data_store_column_entity_1.DataStoreColumn, column);
            const queryRunner = em.queryRunner;
            if (!queryRunner) {
                throw new n8n_workflow_1.UnexpectedError('QueryRunner is not available');
            }
            await this.dataStoreRowsRepository.dropColumnFromTable(dataStoreId, column.name, queryRunner, em.connection.options.type);
            await this.shiftColumns(dataStoreId, column.index, -1, em);
        });
    }
    async moveColumn(dataStoreId, column, targetIndex) {
        await this.manager.transaction(async (em) => {
            const columnCount = await em.countBy(data_store_column_entity_1.DataStoreColumn, { dataStoreId });
            if (targetIndex < 0) {
                throw new data_store_validation_error_1.DataStoreValidationError('tried to move column to negative index');
            }
            if (targetIndex >= columnCount) {
                throw new data_store_validation_error_1.DataStoreValidationError('tried to move column to an index larger than column count');
            }
            await this.shiftColumns(dataStoreId, column.index, -1, em);
            await this.shiftColumns(dataStoreId, targetIndex, 1, em);
            await em.update(data_store_column_entity_1.DataStoreColumn, { id: column.id }, { index: targetIndex });
        });
    }
    async shiftColumns(rawDataStoreId, lowestIndex, delta, em) {
        const executor = em ?? this.manager;
        await executor
            .createQueryBuilder()
            .update(data_store_column_entity_1.DataStoreColumn)
            .set({
            index: () => `index + ${delta}`,
        })
            .where('dataStoreId = :dataStoreId AND index >= :thresholdValue', {
            dataStoreId: rawDataStoreId,
            thresholdValue: lowestIndex,
        })
            .execute();
    }
};
exports.DataStoreColumnRepository = DataStoreColumnRepository;
exports.DataStoreColumnRepository = DataStoreColumnRepository = __decorate([
    (0, di_1.Service)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        data_store_rows_repository_1.DataStoreRowsRepository])
], DataStoreColumnRepository);
//# sourceMappingURL=data-store-column.repository.js.map