import React from 'react';

export type StackOptions = {
  headerShown?: boolean;
  header?: React.ReactNode;
  title?: string;
};

export type ScreenParams<T = undefined> = {
  options?: StackOptions;
  params?: T;
};

export type ProductsStackParamList = {
  PRODUCTS_MAIN: undefined;
  PRODUCTS_LOCATIONS: { productCode: string; productName: string };
};

export type LocationsStackParamList = {
  LOCATIONS_MAIN: undefined;
  LOCATIONS_PRODUCTS: { locationId: number; locationName: string };
};

export type RootStackParamList = {
  DRAWER_MAIN: {
    TABS: ScreenParams;
  };

  TABS: {
    HOME_STACK: ScreenParams;
  };

  HOME_STACK: {
    HOME_MAIN: ScreenParams;
  };
  ENTRIES_STACK: {
    ENTRIES_MAIN: ScreenParams;
    CREATE_ENTRY_SCREEN: ScreenParams;
    ENTRY_DETAIL_SCREEN: ScreenParams<{ id: number }>;
  };
  EXITS_STACK: {
    EXITS_MAIN: ScreenParams;
    EXIT_DETAIL_SCREEN: ScreenParams<{ id: number }>;
  };
  LOCATIONS_STACK: {
    LOCATIONS_MAIN: ScreenParams;
  };
  KEY_ASSIGNMENTS_STACK: {
    KEY_ASSIGNMENTS_MAIN: ScreenParams;
  };
  MOVEMENTS_STACK: {
    MOVEMENTS_MAIN: ScreenParams;
  };
  USERS_STACK: {
    USERS_MAIN: ScreenParams;
    CREATE_USER_SCREEN: ScreenParams;
  };
  REPORTS_STACK: {
    REPORTS_MAIN: ScreenParams;
  };
  CONFIG_STACK: {
    CONFIG_MAIN: ScreenParams;
  };
};

export type StackNames = keyof RootStackParamList;

export type ScreenNames<T extends StackNames> = keyof RootStackParamList[T];

export type NavigationParams<
  T extends StackNames,
  S extends ScreenNames<T>,
> = RootStackParamList[T][S] extends ScreenParams<infer P> ? P : undefined;

export const AppStacks: RootStackParamList = {
  DRAWER_MAIN: {
    TABS: {},
  },
  TABS: {
    HOME_STACK: {},
  },
  HOME_STACK: {
    HOME_MAIN: {},
  },
  ENTRIES_STACK: {
    ENTRIES_MAIN: {},
    CREATE_ENTRY_SCREEN: {},
    ENTRY_DETAIL_SCREEN: {},
  },
  EXITS_STACK: {
    EXITS_MAIN: {},
    EXIT_DETAIL_SCREEN: {},
  },
  LOCATIONS_STACK: {
    LOCATIONS_MAIN: {},
  },
  KEY_ASSIGNMENTS_STACK: {
    KEY_ASSIGNMENTS_MAIN: {},
  },
  MOVEMENTS_STACK: {
    MOVEMENTS_MAIN: {},
  },
  USERS_STACK: {
    USERS_MAIN: {},
    CREATE_USER_SCREEN: {},
  },
  REPORTS_STACK: {
    REPORTS_MAIN: {},
  },
  CONFIG_STACK: {
    CONFIG_MAIN: {},
  },
};
