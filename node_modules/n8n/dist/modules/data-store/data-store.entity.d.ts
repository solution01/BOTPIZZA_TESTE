import { Project, WithTimestampsAndStringId } from '@n8n/db';
import { DataStoreColumn } from './data-store-column.entity';
export declare class DataStore extends WithTimestampsAndStringId {
    constructor();
    name: string;
    columns: DataStoreColumn[];
    project: Project;
    projectId: string;
    sizeBytes: number;
}
