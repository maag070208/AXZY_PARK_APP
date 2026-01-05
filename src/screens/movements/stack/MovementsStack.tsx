import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '../../../navigation/types/navigation.types';
import { MovementsScreen } from '../screens/MovementsScreen';
import { HeaderBack } from '../../../navigation/header/HeaderBack';

const Stack = createNativeStackNavigator<RootStackParamList['MOVEMENTS_STACK']>();

export const MovementsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen 
        name="MOVEMENTS_MAIN" 
        component={MovementsScreen} 
        options={({ navigation }) => ({
            header: () => (
              <HeaderBack
                navigation={navigation}
                title="Movimientos"
                back={true}
              />
            ),
          })}
      />
    </Stack.Navigator>
  );
};
