import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Text,
} from 'react-native';
import {
  LoginFormComponent,
  LoginFormComponentValues,
} from '../components/LoginFormComponent';
import CustomKeyboardAvoidingScrollView from '../../../shared/components/CustomKeyboardAvoidingScrollView';
import { login as loginService } from '../services/AuthService';
import { useDispatch } from 'react-redux';
import { login } from '../../../core/store/slices/user.slice';
import { useAppSelector } from '../../../core/store/hooks';
import { showToast } from '../../../core/store/slices/toast.slice';
import Logo from '../../../shared/assets/logo.png';
import { showLoader } from '../../../core/store/slices/loader.slice';
import LoaderComponent from '../../../shared/components/LoaderComponent';
import { theme } from '../../../shared/theme/theme';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { loading } = useAppSelector(state => state.loaderState);

  const handleLogin = async (values: LoginFormComponentValues) => {
    try {
      console.log('Login submit:', values);
      dispatch(showLoader(true));
      const response = await loginService(
        values.email,
        values.password,
      )
      .catch(error => {
        console.error('Error en login:', error);
          dispatch(
          showToast({
            type: 'error',
            message: error.messages?.[0] || 'Error en el inicio de sesión',
          }),
        );
        return {
          success: false,
          data: null,
          messages: [error.message],
        };
      
      })
      .finally(() => {
        dispatch(showLoader(false));
      });
      console.log('Login response:', response);
      if (response.success && response.data) {
        dispatch(login(response.data));
        dispatch(
          showToast({
            type: 'success',
            message: 'Inicio de sesión exitoso',
          }),
        );
      }
    } catch (error) {
      console.error('Error en login:', error);
      dispatch(showLoader(false));
    }
  };

return (
    <View style={styles.container}>
      <CustomKeyboardAvoidingScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image source={Logo} resizeMode="contain" style={styles.logo} />
            
            {/* TÍTULO ESTILO PARKI */}
            <View style={styles.welcomeTitleContainer}>
              <Text style={styles.welcomeTitle}>Bienvenido a </Text>
              <Text style={styles.brandPark}>Park</Text>
              <View style={styles.iContainer}>
                <View style={styles.iDot} />
                <Text style={styles.brandI}>i</Text>
              </View>
            </View>

            <Text style={styles.welcomeSubtitle}>
              Inicia sesión para continuar
            </Text>
          </View>

          <View style={styles.formContainer}>
            <LoginFormComponent onSubmit={handleLogin} loading={loading} />
          </View>
      </CustomKeyboardAvoidingScrollView>
      <LoaderComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Usamos el blanco limpio del tema
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center', // Centra el contenido verticalmente
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  welcomeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Para que el texto alinee bien las bases
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.grayDark, // Un poco más suave para que resalte la marca
  },
  brandPark: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.secondary, // El azul oscuro del logo (#1D2B3A)
    letterSpacing: -0.5,
  },
  iContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandI: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.primary, // El azul vibrante del logo (#007BFF)
    marginTop: -4, // Ajuste fino para la 'i'
  },
  iDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tertiary, // El azul celeste del logo para el punto
    position: 'absolute',
    top: 4, 
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.grayDark,
    textAlign: 'center',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    // Añadimos una sombra leve al contenedor del formulario si quieres que flote
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
});

export default LoginScreen;
