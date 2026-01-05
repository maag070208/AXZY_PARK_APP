import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { ExitsScreen } from '../screens/ExitsScreen';
import { EntryDetailScreen } from '../../entries/screens/EntryDetailScreen'; // Reuse Entry Detail

const Stack = createNativeStackNavigator();

export const ExitsStack = () => {
  return (
    <Stack.Navigator
        screenOptions={{
            animation: 'slide_from_right',
        }}
        initialRouteName="EXITS_MAIN"
    >
        <Stack.Screen 
            name="EXITS_MAIN"
            component={ExitsScreen}
            options={({ navigation }) => ({
                header: () => (
                    <HeaderBack navigation={navigation} title="Salidas" back={false} /> // No back on main tab
                ),
            })}
        />
        <Stack.Screen 
            name="EXIT_DETAIL_SCREEN"
            component={EntryDetailScreen} // Reuse Entry Detail for now
            options={({ navigation }) => ({
                header: () => (
                    <HeaderBack navigation={navigation} title="Detalle de Salida" back={true} />
                ),
            })}
        />
    </Stack.Navigator>
  );
};
