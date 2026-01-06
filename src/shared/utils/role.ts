import { store } from '../../core/store/redux.config';

export const getRoleValid = (role: string): boolean => {
  const state = store.getState();
  const userRole = state.userState.role;

  if (!userRole) {
    return false;
  }

  return userRole === role;
};
