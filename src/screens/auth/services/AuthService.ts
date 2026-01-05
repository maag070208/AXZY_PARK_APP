import { post } from '../../../core/axios';
import { API_CONSTANTS } from '../../../core/constants/API_CONSTANTS';
import { TResult } from '../../../core/types/TResult';

export const login = async (
  email: string,
  password: string,
): Promise<TResult<string>> => {
  return await post(API_CONSTANTS.URLS.AUTH.LOGIN, {
    email,
    password,
  });
};
