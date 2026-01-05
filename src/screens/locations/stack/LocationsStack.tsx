import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { LocationsScreen } from '../screens/LocationsScreen';
import { LocationProductsScreen } from '../screens/LocationProductsScreen';
import { HeaderMain } from '../../../navigation/header/HeaderMain';
import { HeaderBack } from '../../../navigation/header/HeaderBack';

const Stack = createNativeStackNavigator();

export const LocationsStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LOCATIONS_MAIN"
        component={LocationsScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Ubicaciones"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="LOCATIONS_PRODUCTS"
        component={LocationProductsScreen}
        options={({ navigation, route }: any) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title={`Productos en: ${
                route.params?.locationName || 'Ubicación'
              }`}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
