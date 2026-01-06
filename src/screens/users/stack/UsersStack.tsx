import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { UsersScreen } from '../screens/UsersScreen';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { CreateUserScreen } from '../screens/CreateUserScreen';

const Stack = createNativeStackNavigator();

export const UsersStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                contentStyle: { backgroundColor: '#f8fafc' },
            }}
        >
            <Stack.Screen
                name="USERS_MAIN"
                component={UsersScreen}
                options={({ navigation }) => ({
                    header: () => (
                        <HeaderBack
                            navigation={navigation}
                            title="Usuarios"
                            enableBack={false}
                        />
                    ),
                })}
            />
             <Stack.Screen
                name="CREATE_USER_SCREEN"
                component={CreateUserScreen}
                options={({ navigation }) => ({
                    header: () => (
                        <HeaderBack
                            navigation={navigation}
                            title="Nuevo Usuario"
                            enableBack={true}
                        />
                    ),
                })}
            />
        </Stack.Navigator>
    );
};
