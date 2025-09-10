import { type DataStoreCreateColumnSchema, type ListDataStoreQueryDto } from '@n8n/api-types';
import { DataSource, EntityManager, Repository } from '@n8n/typeorm';
import { DataStoreRowsRepository } from './data-store-rows.repository';
import { DataStore } from './data-store.entity';
export declare class DataStoreRepository extends Repository<DataStore> {
    private dataStoreRowsRepository;
    constructor(dataSource: DataSource, dataStoreRowsRepository: DataStoreRowsRepository);
    createDataStore(projectId: string, name: string, columns: DataStoreCreateColumnSchema[]): Promise<DataStore>;
    deleteDataStore(dataStoreId: string, entityManager?: EntityManager): Promise<boolean>;
    deleteDataStoreByProjectId(projectId: string): Promise<boolean>;
    deleteDataStoreAll(): Promise<boolean>;
    getManyAndCount(options: Partial<ListDataStoreQueryDto>): Promise<{
        count: number;
        data: DataStore[];
    }>;
    getMany(options: Partial<ListDataStoreQueryDto>): Promise<DataStore[]>;
    private getManyQuery;
    private applySelections;
    private applyFilters;
    private applySorting;
    private parseSortingParams;
    private applySortingByField;
    private applyPagination;
    private applyDefaultSelect;
    private getDataStoreColumnFields;
    private getProjectFields;
}
