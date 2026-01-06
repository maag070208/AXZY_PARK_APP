import { get, post, put, remove } from "../../../core/axios";

export interface VehicleType {
    id: number;
    name: string;
    cost: number;
    createdAt: string;
    updatedAt: string;
}

export const getVehicleTypes = async () => {
    return await get<VehicleType[]>("/vehicle-types");
};

export const createVehicleType = async (data: { name: string; cost: number }) => {
    return await post<VehicleType>("/vehicle-types", data);
};

export const updateVehicleType = async (id: number, data: { name?: string; cost?: number }) => {
    return await put<VehicleType>(`/vehicle-types/${id}`, data);
};

export const deleteVehicleType = async (id: number) => {
    return await remove<boolean>(`/vehicle-types/${id}`);
};
