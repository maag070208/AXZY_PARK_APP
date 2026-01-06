import { get, put } from "../../../core/axios";

export interface SystemConfig {
    maxCapacity: number;
    dayCost: number;
}

export const getSystemConfig = async () => {
    return await get<SystemConfig>("/config");
};

export const updateSystemConfig = async (maxCapacity: number, dayCost: number) => {
    return await put<SystemConfig>("/config", { maxCapacity, dayCost });
};
