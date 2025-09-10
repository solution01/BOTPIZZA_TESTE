import { DataStoreCreateColumnSchema } from '@n8n/api-types';
import { DataSource, EntityManager, Repository } from '@n8n/typeorm';
import { DataStoreColumn } from './data-store-column.entity';
import { DataStoreRowsRepository } from './data-store-rows.repository';
export declare class DataStoreColumnRepository extends Repository<DataStoreColumn> {
    private dataStoreRowsRepository;
    constructor(dataSource: DataSource, dataStoreRowsRepository: DataStoreRowsRepository);
    getColumns(rawDataStoreId: string, em?: EntityManager): Promise<DataStoreColumn[]>;
    addColumn(dataStoreId: string, schema: DataStoreCreateColumnSchema): Promise<DataStoreColumn>;
    deleteColumn(dataStoreId: string, column: DataStoreColumn): Promise<void>;
    moveColumn(dataStoreId: string, column: DataStoreColumn, targetIndex: number): Promise<void>;
    shiftColumns(rawDataStoreId: string, lowestIndex: number, delta: -1 | 1, em?: EntityManager): Promise<void>;
}
