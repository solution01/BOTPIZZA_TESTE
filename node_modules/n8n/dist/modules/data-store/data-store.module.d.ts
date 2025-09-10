import type { ModuleInterface } from '@n8n/decorators';
import { BaseEntity } from '@n8n/typeorm';
export declare class DataStoreModule implements ModuleInterface {
    init(): Promise<void>;
    shutdown(): Promise<void>;
    entities(): Promise<(new () => BaseEntity)[]>;
}
