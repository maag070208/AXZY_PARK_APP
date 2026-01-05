import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, HelperText, Text } from 'react-native-paper';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createUser } from '../../../users/services/UserService';
import { showToast } from '../../../../core/store/slices/toast.slice';
import { useAppDispatch } from '../../../../core/store/hooks';

interface Props {
  onCancel: () => void;
  onSuccess: (user: any) => void;
}

const UserSchema = Yup.object().shape({
  name: Yup.string().required('Nombre es requerido'),
  paternalSurname: Yup.string().required('Apellido Paterno es requerido'),
  maternalSurname: Yup.string().required('Apellido Materno es requerido'),
  email: Yup.string().email('Email inválido').required('Email es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerida'),
});

export const NewUserForm = ({ onCancel, onSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      paternalSurname: '',
      maternalSurname: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: UserSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {

        const body = {
          name: values.name,
          lastName: `${values.paternalSurname} ${values.maternalSurname}`,
          email: values.email,
          password: values.password,
          role: 'USER',
        };
        console.log(body);
        const res = await createUser(body).catch((error) => {
          console.log(error);
          dispatch(showToast({ type: 'error', message: 'Error al crear usuario' }));
        });
        console.log(res);
        if (res && res.data) { // Assuming response structure wrapper
             dispatch(showToast({ type: 'success', message: 'Usuario creado correctamente' }));
             onSuccess(res.data);
        } else {
             dispatch(showToast({ type: 'error', message: 'Error al crear usuario' }));
        }
      } catch (error) {
        dispatch(showToast({ type: 'error', message: 'Error de conexión' }));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>Nuevo Cliente</Text>
      
      <TextInput
        label="Nombre"
        value={formik.values.name}
        onChangeText={formik.handleChange('name')}
        onBlur={formik.handleBlur('name')}
        mode="outlined"
        error={formik.touched.name && !!formik.errors.name}
        style={styles.input}
      />
      
      <View style={styles.row}>
          <View style={styles.col}>
            <TextInput
                label="Ap. Paterno"
                value={formik.values.paternalSurname}
                onChangeText={formik.handleChange('paternalSurname')}
                onBlur={formik.handleBlur('paternalSurname')}
                mode="outlined"
                error={formik.touched.paternalSurname && !!formik.errors.paternalSurname}
                style={styles.input}
            />
          </View>
          <View style={styles.col}>
            <TextInput
                label="Ap. Materno"
                value={formik.values.maternalSurname}
                onChangeText={formik.handleChange('maternalSurname')}
                onBlur={formik.handleBlur('maternalSurname')}
                mode="outlined"
                error={formik.touched.maternalSurname && !!formik.errors.maternalSurname}
                style={styles.input}
            />
          </View>
      </View>

      <TextInput
        label="Email"
        value={formik.values.email}
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
        error={formik.touched.email && !!formik.errors.email}
        style={styles.input}
      />

      <TextInput
        label="Contraseña"
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        onBlur={formik.handleBlur('password')}
        mode="outlined"
        secureTextEntry
        error={formik.touched.password && !!formik.errors.password}
        style={styles.input}
      />

      <TextInput
        label="Confirmar"
        value={formik.values.confirmPassword}
        onChangeText={formik.handleChange('confirmPassword')}
        onBlur={formik.handleBlur('confirmPassword')}
        mode="outlined"
        secureTextEntry
        error={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
        style={styles.input}
      />
      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <HelperText type="error">{formik.errors.confirmPassword}</HelperText>
      )}

      <View style={styles.actions}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          Cancelar
        </Button>
        <Button mode="contained" onPress={() => formik.handleSubmit()} loading={loading} style={styles.button}>
          Guardar
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  row: {
      flexDirection: 'row',
      gap: 8,
  },
  col: {
      flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  button: {
      flex: 1,
  }
});
