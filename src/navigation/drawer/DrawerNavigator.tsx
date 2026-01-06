import { createDrawerNavigator } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import React from 'react';
import { DRAWER_WHITELIST } from '../../core/constants/navigation.constants';
import { EntriesStack } from '../../screens/entries/stack/EntriesStack';
import { LocationsStack } from '../../screens/locations/stack/LocationsStack';
import { KeyAssignmentsStack } from '../../screens/key-assignments/stack/KeyAssignmentsStack';
import { MovementsStack } from '../../screens/movements/stack/MovementsStack';
import { UsersStack } from '../../screens/users/stack/UsersStack';
import { ReportsStack } from '../../screens/reports/stack/ReportsStack';
import { ConfigStack } from '../../screens/config/stack/ConfigStack';
import { ExitsStack } from '../../screens/exits/stack/ExitsStack';
import TabNavigator from '../tabs/TabNavigator';
import DrawerContent from './DrawerContent';
import { useAppSelector } from '../../core/store/hooks';
import { ProfileScreen } from '../../screens/users/screens/ProfileScreen';

const Drawer = createDrawerNavigator();

const getActiveRouteName = (route: any): string => {
  const childName = getFocusedRouteNameFromRoute(route);

  if (!childName) {
    if (route.name === 'HOME_STACK') return 'HOME_MAIN';
    if (route.name === 'ENTRIES_STACK') return 'ENTRIES_MAIN';
    if (route.name === 'LOCATIONS_STACK') return 'LOCATIONS_MAIN';
    if (route.name === 'KEY_ASSIGNMENTS_STACK') return 'KEY_ASSIGNMENTS_MAIN';
    if (route.name === 'MOVEMENTS_STACK') return 'MOVEMENTS_MAIN';
    if (route.name === 'USERS_STACK') return 'USERS_MAIN';
    if (route.name === 'REPORTS_STACK') return 'REPORTS_MAIN';
    if (route.name === 'CONFIG_STACK') return 'CONFIG_MAIN';
    if (route.name === 'Tabs') return 'HOME_MAIN';
    return route.name;
  }

  const childRoute = route.state?.routes?.find(
    (r: any) => r.name === childName,
  );
  if (childRoute) {
    return getActiveRouteName(childRoute);
  }

  return childName;
};

const isDrawerEnabled = (route: any) => {
  const routeName = getActiveRouteName(route);
  return DRAWER_WHITELIST.includes(routeName);
};

const DrawerNavigator = () => {
  const { role } = useAppSelector(state => state.userState);
  const isAdmin = role === 'ADMIN';
  const isOperator = role === 'OPERATOR';
  // Only Admin and Operator can view operational modules (Locations, Exits)
  const canViewOperation = isAdmin || isOperator;

  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={props => <DrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabNavigator}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      <Drawer.Screen
        name="ENTRIES_STACK"
        component={EntriesStack}
        options={({ route }) => ({
          swipeEnabled: isDrawerEnabled(route),
        })}
      />

      {canViewOperation && (
        <Drawer.Screen
          name="LOCATIONS_STACK"
          component={LocationsStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      {isAdmin && (
        <Drawer.Screen
          name="KEY_ASSIGNMENTS_STACK"
          component={KeyAssignmentsStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      {isAdmin && (
        <Drawer.Screen
          name="MOVEMENTS_STACK"
          component={MovementsStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      {canViewOperation && (
        <Drawer.Screen
          name="EXITS_STACK"
          component={ExitsStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      {isAdmin && (
        <Drawer.Screen
          name="USERS_STACK"
          component={UsersStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      {isAdmin && (
        <Drawer.Screen
          name="REPORTS_STACK"
          component={ReportsStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      {isAdmin && (
        <Drawer.Screen
          name="CONFIG_STACK"
          component={ConfigStack}
          options={({ route }) => ({
            swipeEnabled: isDrawerEnabled(route),
          })}
        />
      )}

      <Drawer.Screen
        name="PROFILE_SCREEN"
        component={ProfileScreen}
        options={{ 
            swipeEnabled: false,
            drawerItemStyle: { display: 'none' } 
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
