import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { RootStackParamList } from '../../../navigation/types/navigation.types';
import { KeyAssignmentsScreen } from '../screens/KeyAssignmentsScreen';
import { HeaderBack } from '../../../navigation/header/HeaderBack';

const Stack =
  createNativeStackNavigator<RootStackParamList['KEY_ASSIGNMENTS_STACK']>();

export const KeyAssignmentsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen
        name="KEY_ASSIGNMENTS_MAIN"
        component={KeyAssignmentsScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Asignaciones de llaves"
              back={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
