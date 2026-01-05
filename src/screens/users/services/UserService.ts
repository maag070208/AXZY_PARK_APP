import { get, post } from "../../../core/axios";
import { IAuthToken } from "../../../core/types/IUser";

export interface User extends IAuthToken {}

export const getUsers = async (q?: string) => {
  return await get<User[]>("/users", { params: { q } });
};

export const createUser = async (data: any) => {
  return await post<User>("/users", data);
};
