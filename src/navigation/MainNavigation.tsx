import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './drawer/DrawerNavigator';
import { jwtDecode } from 'jwt-decode';
import { logout } from '../core/store/slices/user.slice';
import { useAppDispatch, useAppSelector } from '../core/store/hooks';
import LoginScreen from '../screens/auth/screens/LoginScreen';
import LoaderComponent from '../shared/components/LoaderComponent';
import { IAuthToken } from '../core/types/IUser';
import { useEffect } from 'react';

const MainNavigation = () => {
  const { isSignedIn, token } = useAppSelector(state => state.userState);
  const dispatch = useAppDispatch();

  const validateToken = () => {
    if (isSignedIn && token) {
      try {
        const decoded = jwtDecode<IAuthToken>(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token ya expirado
          dispatch(logout());
        }
      } catch (error) {
        dispatch(logout());
      }
    }
  };

  useEffect(() => {
    if (isSignedIn && token) {
      validateToken();

      // Configurar timeout para cuando expire (backup)
      try {
        const decoded = jwtDecode<IAuthToken>(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
          const timer = setTimeout(() => {
            dispatch(logout());
          }, timeUntilExpiry);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [isSignedIn, token, dispatch]);

  return (
    <>
      <LoaderComponent />
      <NavigationContainer onStateChange={validateToken}>
        {isSignedIn ? <DrawerNavigator /> : <LoginScreen />}
      </NavigationContainer>
    </>
  );
};

export default MainNavigation;
