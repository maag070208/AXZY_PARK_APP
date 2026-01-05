import { get } from "../../../core/axios";

export interface Location {
    id: number;
    name: string;
    section: string;
    aisle: string;
    spot: string;
    isOccupied: boolean;
}

export const getLocations = async () => {
  return await get<Location[]>("/locations");
};
