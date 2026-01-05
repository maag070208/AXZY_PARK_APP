import { Formik } from 'formik';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import * as Yup from 'yup';
import { ILocation, ILocationCreate } from '../type/location.types';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: ILocationCreate) => void;
  initialData?: ILocation | null;
  loading?: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('El nombre de la zona es obligatorio'),
});

export const LocationFormModal = ({
  visible,
  onDismiss,
  onSubmit,
  initialData,
  loading,
}: Props) => {
  const initialValues = {
    name: initialData?.name || '',
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <Text variant="headlineSmall" style={styles.title}>
          {initialData ? 'Editar Zona' : 'Nueva Zona'}
        </Text>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={values => {
            onSubmit({
                // @ts-ignore
              name: values.name,
              aisle: values.name, // Keep for compat
              spot: ''
            });
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Nombre de Zona"
                  placeholder="Ej: A, B, Norte..."
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && !!errors.name}
                  style={styles.input}
                />
                {touched.name && errors.name && (
                  <HelperText type="error" visible={true}>
                    {errors.name}
                  </HelperText>
                )}
              </View>

              <View style={styles.actions}>
                <Button onPress={onDismiss} style={styles.button}>
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Guardar
                </Button>
              </View>
            </>
          )}
        </Formik>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 16,
    elevation: 4,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  button: {
    marginLeft: 12,
    borderRadius: 8,
  },
});
