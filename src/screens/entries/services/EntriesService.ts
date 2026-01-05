import { get, post, put } from "../../../core/axios";
import { VehicleEntry } from "../../../core/types/VehicleEntry";

export const getEntries = async () => {
  return await get<VehicleEntry[]>("/entries");
};

export const getEntryById = async (id: number) => {
  return await get<VehicleEntry>(`/entries/${id}`);
};

export const getLastUserEntry = async (userId: number) => {
    return await get<VehicleEntry>(`/entries/user/${userId}/latest`);
};

export const getUserVehicles = async (userId: number) => {
    return await get<VehicleEntry[]>(`/entries/user/${userId}/vehicles`);
};

export const createEntry = async (formData: FormData) => {
  return await post<VehicleEntry>("/entries", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadFile = async (file: any) => {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.fileName || 'photo.jpg'
  } as any);
  // Returns { success: true, data: { url: "/uploads/..." } }
  return await post<{ url: string }>("/uploads", formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const assignKey = async (entryId: number, operatorId: number, type: string, targetLocationId?: number) => {
  return await post("/key-assignments", { entryId, operatorId, type, targetLocationId });
};

export const finishKeyAssignment = async (assignmentId: number) => {
    return await put(`/key-assignments/${assignmentId}/finish`, {});
};
export interface KeyAssignment {
    id: number;
    entryId: number;
    operatorUserId: number;
    type: "MOVEMENT" | "DELIVERY";
    status: "ACTIVE" | "COMPLETED";
    startedAt: string;
    endedAt?: string;
    entry?: VehicleEntry;
    operator?: { name: string; lastName: string };
    targetLocation?: { id: number; aisle: string; spot: string; name: string };
    targetLocationId?: number;
}

export const getKeyAssignments = async () => {
    return await get<KeyAssignment[]>("/key-assignments");
};

export const createExtraCost = async (data: {
    entryId: number;
    userId: number;
    operatorId: number;
    reason: string;
    amount: number;
    imageUrl?: string;
}) => {
    return await post("/extra-costs", data);
};
