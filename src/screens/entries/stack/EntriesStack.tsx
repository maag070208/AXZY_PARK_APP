import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { CreateEntryScreen } from '../screens/CreateEntryScreen';
import { EntriesScreen } from '../screens/EntriesScreen';
import { EntryDetailScreen } from '../screens/EntryDetailScreen';

const Stack = createNativeStackNavigator();

export const EntriesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'slide_from_right',
      }}
      initialRouteName="ENTRIES_MAIN"
    >
      <Stack.Screen
        name="ENTRIES_MAIN"
        component={EntriesScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack navigation={navigation} title="Entradas" back={true} />
          ),
        })}
      />
      <Stack.Screen
        name="CREATE_ENTRY_SCREEN"
        component={CreateEntryScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Nueva Entrada"
              back={true}
            />
          ),
        })}
      />
      <Stack.Screen
        name="ENTRY_DETAIL_SCREEN"
        component={EntryDetailScreen}
        options={({ navigation }) => ({
          header: () => (
            <HeaderBack
              navigation={navigation}
              title="Detalle de Entrada"
              back={true}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
};
