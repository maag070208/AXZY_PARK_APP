import { get } from "../axios";
import { TResult } from "../types/TResult";

export const getUserById = async (id: number): Promise<TResult<any>> => {
  return get(`/User/${id}`);
};