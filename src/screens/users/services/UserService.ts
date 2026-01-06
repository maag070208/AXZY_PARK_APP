import { get, post, put } from "../../../core/axios";
import { IAuthToken } from "../../../core/types/IUser";

export interface User extends IAuthToken {}

export const getUsers = async (q?: string) => {
  return await get<User[]>("/users", { params: { q } });
};

export const createUser = async (data: any) => {
  return await post<User>("/users", data);
};

export const updateUserProfile = async (id: number, data: { name: string; lastName: string; email: string }) => {
  return await put<User>(`/users/${id}`, data);
};

export const changePassword = async (id: number, data: { oldPassword: string; newPassword: string }) => {
  return await put<boolean>(`/users/${id}/password`, data);
};
