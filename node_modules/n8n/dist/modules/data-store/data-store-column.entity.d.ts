import { WithTimestampsAndStringId } from '@n8n/db';
import { type DataStore } from './data-store.entity';
export declare class DataStoreColumn extends WithTimestampsAndStringId {
    dataStoreId: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    index: number;
    dataStore: DataStore;
}
