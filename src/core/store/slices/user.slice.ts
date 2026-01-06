import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { IAuthToken } from '../../types/IUser';

export interface IUserState {
  id: string | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
  role: string | null;
  token: string | null;
  isSignedIn: boolean;
}

const initialState: IUserState = {
  id: null,
  username: null,
  email: null,
  fullName: null,
  role: null ,
  token: null,
  isSignedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string | null>) => {
      if (!action.payload) return initialState;

      const decoded = jwtDecode<IAuthToken>(action.payload);

      state.id = String(decoded.id);
      state.username = decoded.username;
      state.email = decoded.email;
      state.fullName = `${decoded.name} ${decoded.lastName}`;
      state.role = decoded.role;

      state.isSignedIn = true;
      state.token = action.payload;
    },

    logout: () => initialState,
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
