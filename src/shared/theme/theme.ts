// theme.ts
import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    // NUEVA PALETA BASADA EN EL LOGO PARKI
    activeSubstanceLink: '#007BFF', // Azul vibrante del degradado
    addressButton: '#007BFF',
    romaCard: '#007BFF',
    onRomaCard: '#FFFFFF',
    paragraph: '#344054',

    // COLOR PRIMARIO (Azul Vibrante del degradado superior)
    primary: '#007BFF', 
    onPrimary: '#FFFFFF',
    primaryContainer: '#E0F0FF',
    onPrimaryContainer: '#001D3D',

    // COLOR SECUNDARIO (Azul Marino del texto "Parki")
    secondary: '#1D2B3A', 
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F0F4F8',
    onSecondaryContainer: '#101828',

    // TERCIARIO (Azul Celeste de la parte superior del pin)
    tertiary: '#48CAE4',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#CAF0F8',
    onTertiaryContainer: '#003049',

    quaternary: '#CCCCCC',
    onQuaternary: '#000000',

    graySystem: '#F4F4F9',
    grayDark: '#667085',

    background: '#FFFFFF',
    onBackground: '#1D2B3A', // Usando el azul oscuro del logo en lugar de negro puro

    surface: '#FFFFFF',
    onSurface: '#1D2B3A',
    surfaceVariant: '#F2F4F7',
    onSurfaceVariant: '#475467',
    surfaceDisabled: 'rgba(29, 43, 58, 0.12)',
    onSurfaceDisabled: 'rgba(29, 43, 58, 0.38)',

    outline: '#D0D5DD',
    disabled: '#D0D5DD',
    onDisabled: '#667085',
    outlineVariant: '#EAECF0',
    lightGray: '#F9FAFB',
    darkGray: '#344054',
    shadow: '#000000',
    scrim: '#000000',

    inverseSurface: '#1D2B3A',
    inverseOnSurface: '#F9FAFB',
    inversePrimary: '#48CAE4',

    elevation: {
      level0: 'transparent',
      level1: '#F8FAFC',
      level2: '#F1F5F9',
      level3: '#E2E8F0',
      level4: '#CBD5E1',
      level5: '#94A3B8',
    },

    backdrop: 'rgba(29, 43, 58, 0.4)',

    success: '#12B76A',
    onSuccess: '#FFFFFF',
    successContainer: '#D1FADF',
    onSuccessContainer: '#027A48',

    error: '#F04438',
    onError: '#FFFFFF',
    errorContainer: '#FEE4E2',
    onErrorContainer: '#B42318',

    warning: '#F79009',
    onWarning: '#FFFFFF',
    warningContainer: '#FEF0C7',
    onWarningContainer: '#B54708',

    info: '#2E90FA',
    onInfo: '#FFFFFF',
    infoContainer: '#D1E9FF',
    onInfoContainer: '#175CD3',

    input: {
      lightGray: '#F2F4F7',
      borderGray: '#D0D5DD',
      darkGray: '#667085',
    },

    // Home design actualizado
    TabNavigationBackground: '#FFFFFF',
    TabNavigationIcon: '#94A3B8',
    TabNavigationIconFocused: '#007BFF', // Azul primario para foco
  },
};
export type ThemeColorsType = {
  primary: string;
  paragraph: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  secondary: string;
  onSecondary: string;
  tertiary: string;
  onTertiary: string;
  error: string;
  onError: string;
  success: string;
  onSuccess: string;
  disabled: string;
  onDisabled: string;
  warning: string;
  onWarning: string;
  info: string;
  onInfo: string;
  black: string;
  white: string;
  onWhite: string;
  background: string;
  onBackground: string;
  quaternary: string;
  romaCard: string;
  onRomaCard: string;
  onQuaternary: string;
  grayDark: string;
  addressButton: string;
};

export const ThemeColors: ThemeColorsType = {
  primary: theme.colors.primary,
  paragraph: theme.colors.paragraph,
  onPrimary: theme.colors.onPrimary, // Ahora será blanco
  primaryContainer: theme.colors.primaryContainer,
  onPrimaryContainer: theme.colors.onPrimaryContainer,
  tertiaryContainer: theme.colors.tertiaryContainer,
  onTertiaryContainer: theme.colors.onTertiaryContainer,
  secondary: theme.colors.secondary,
  onSecondary: theme.colors.onSecondary,
  tertiary: theme.colors.tertiary,
  onTertiary: theme.colors.onTertiary,
  disabled: theme.colors.disabled,
  onDisabled: theme.colors.onDisabled,
  error: theme.colors.error,
  onError: theme.colors.onError,
  success: theme.colors.success,
  onSuccess: theme.colors.onSuccess,
  warning: theme.colors.warning,
  onWarning: theme.colors.onWarning,
  info: theme.colors.info,
  onInfo: theme.colors.onInfo,
  black: theme.colors.onBackground,
  onWhite: theme.colors.primary,
  white: theme.colors.background,
  background: theme.colors.background,
  onBackground: theme.colors.onBackground,
  quaternary: theme.colors.quaternary,
  onQuaternary: theme.colors.onQuaternary,
  romaCard: theme.colors.romaCard,
  onRomaCard: theme.colors.onRomaCard,
  grayDark: theme.colors.grayDark,
  addressButton: theme.colors.addressButton,
};

/**
 * Obtiene el color asociado al color que se busca, ejemplo si busca "primary" obtiene el "onPrimary" y viceversa
 * @param color
 * @returns color asociado al que se introdujo.
 */
const getAssociatedColor = (
  color: keyof ThemeColorsType,
): keyof ThemeColorsType => {
  if (color.startsWith('on')) {
    return color.slice(2).toLowerCase() as keyof ThemeColorsType;
  }
  return `on${color.charAt(0).toUpperCase()}${color.slice(
    1,
  )}` as keyof ThemeColorsType;
};

/**
 * Obtiene el color del fondo y del texto por su clave
 * @param color
 * @returns Retorna {backgroundColor, textColor}
 */
export const getThemeColor = (
  color: keyof ThemeColorsType,
): { backgroundColor: string; textColor: string } => {
  const backgroundColor = ThemeColors[color];
  const associatedColorKey = getAssociatedColor(color);
  const textColor = ThemeColors[associatedColorKey];

  return { backgroundColor, textColor };
};

export const getThemeKeyByColor = (color: string): keyof ThemeColorsType => {
  const themeColors = Object.keys(ThemeColors) as Array<keyof ThemeColorsType>;
  return themeColors.find(
    key => ThemeColors[key] === color,
  ) as keyof ThemeColorsType;
};

export const AppStyles = StyleSheet.create({
  containerAndMargin: {
    flex: 1,
    backgroundColor: theme.colors.TabNavigationBackground,
    paddingHorizontal: 20,
  },

  container: {
    flex: 1,
    backgroundColor: theme.colors.TabNavigationBackground,
  },
  closeButtonStyle: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
  },
  containerMargin: {
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginVertical: 10,
  },
  activityIndicator: {},
  shadowBox: {
    shadowColor: '#171717',
    borderWidth: 0.5,
    borderColor: '#a0a0a0',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  defaultBorderRadius: {
    borderRadius: 10,
  },
});

export const TabNavigationHeaderStyle = {
  headerStyle: {
    backgroundColor: theme.colors.TabNavigationBackground,
  },
  headerTintColor: theme.colors.TabNavigationBackground,
};

export const TabNavigationStyle = {
  tin: {
    tabBarActiveTintColor: theme.colors.TabNavigationIconFocused,
    tabBarInactiveTintColor: theme.colors.TabNavigationIcon,
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: theme.colors.TabNavigationBackground,
  },
};
