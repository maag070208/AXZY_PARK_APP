import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VehicleTypesScreen } from '../screens/VehicleTypesScreen';
import { ConfigScreen } from '../screens/ConfigScreen';

const Stack = createNativeStackNavigator();

export const ConfigStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CONFIG_MAIN" component={ConfigScreen} />
      <Stack.Screen name="VEHICLE_TYPES_SCREEN" component={VehicleTypesScreen} options={{ headerShown: true, title: 'Tipos de Vehículos' }} />
    </Stack.Navigator>
  );
};
