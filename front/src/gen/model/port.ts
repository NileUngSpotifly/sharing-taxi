/**
 * Sharing taxi api docs
 * Api description
 *
 * OpenAPI spec version: v1
 * Contact: contact@snippets.local
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */


export interface Port { 
    readonly id?: number;
    name: string;
    lat: number;
    lon: number;
    workload?: Port.WorkloadEnum;
    district: number;
}
export namespace Port {
    export type WorkloadEnum = 'empty' | 'busy' | 'full';
    export const WorkloadEnum = {
        Empty: 'empty' as WorkloadEnum,
        Busy: 'busy' as WorkloadEnum,
        Full: 'full' as WorkloadEnum
    };
}
