import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ReportsScreen } from '../screens/ReportsScreen';
import { HeaderBack } from '../../../navigation/header/HeaderBack';

const Stack = createNativeStackNavigator();

export const ReportsStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                contentStyle: { backgroundColor: '#f8fafc' },
            }}
        >
            <Stack.Screen
                name="REPORTS_MAIN"
                component={ReportsScreen}
                options={({ navigation }) => ({
                    header: () => (
                        <HeaderBack
                            navigation={navigation}
                            title="Reportes"
                            enableBack={false}
                        />
                    ),
                })}
            />
        </Stack.Navigator>
    );
};
