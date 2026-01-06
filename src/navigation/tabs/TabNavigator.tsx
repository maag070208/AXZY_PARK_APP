import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { EntriesStack } from '../../screens/entries/stack/EntriesStack';
import { ExitsStack } from '../../screens/exits/stack/ExitsStack';
import HomeStack from '../../screens/home/stack/HomeStack';
import { MovementsStack } from '../../screens/movements/stack/MovementsStack';
import { useAppSelector } from '../../core/store/hooks';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { role } = useAppSelector(state => state.userState);
  const isRestricted = role === 'USER';
  const isOperator = role === 'OPERATOR';

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HOME_STACK"
        component={HomeStack}
        options={({ route }) => ({
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        })}
      />

      <Tab.Screen
        name="ENTRIES_STACK"
        component={EntriesStack}
        options={({ route }) => ({
          title: 'Entradas',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color }) => (
            <Icon name="car-arrow-right" size={24} color={color} />
          ),
        })}
      />

      {!isRestricted && (
        <>
          <Tab.Screen
            name="EXITS_STACK"
            component={ExitsStack}
            options={({ route }) => ({
              title: 'Salidas',
              tabBarStyle: { display: 'none' },
              tabBarIcon: ({ color }) => (
                <Icon name="car-arrow-left" size={24} color={color} />
              ),
            })}
          />

          {!isOperator && <Tab.Screen
            name="MOVEMENTS_STACK"
            component={MovementsStack}
            options={({ route }) => ({
              title: 'Movimientos',
              tabBarStyle: { display: 'none' },
              tabBarIcon: ({ color }) => (
                <Icon
                  name="clipboard-text-clock-outline"
                  size={24}
                  color={color}
                />
              ),
            })}
          />  }
        </>
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;
