import { Formik } from 'formik';
import React, { useState } from 'react';
import { Image, Modal as RNModal, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import { getFullImageUrl } from '../../../core/utils/imageUtils';
import CameraComponent from '../../../shared/components/Camera';
import { uploadFile } from '../services/EntriesService';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const validationSchema = Yup.object().shape({
  reason: Yup.string().required('El motivo es obligatorio'),
  amount: Yup.number().required('El costo es obligatorio').min(0, 'El costo debe ser mayor o igual a 0'),
});

export const AddExtraCostModal = ({ visible, onDismiss, onSubmit, loading }: Props) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoTaken = async (photoData: { uri: string; path: string }) => {
      setShowCamera(false);
      setUploadingPhoto(true);
      try {
           const res = await uploadFile({
                uri: photoData.uri,
                type: 'image/jpeg',
                fileName: `extracost_${Date.now()}.jpg`
           });

           if (res && res.data && res.data.url) {
                setPhoto(res.data.url);
           }
      } catch (e) {
          console.error("Error uploading photo", e);
      } finally {
          setUploadingPhoto(false);
      }
  };

  const handleRemovePhoto = () => {
      setPhoto(null);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="headlineSmall" style={styles.title}>Nuevo Costo Extra</Text>
        
        <RNModal visible={showCamera} animationType="slide" onRequestClose={() => setShowCamera(false)}>
            <CameraComponent 
                onPhotoTaken={handlePhotoTaken} 
                onCancel={() => setShowCamera(false)} 
            />
        </RNModal>

        <Formik
            initialValues={{ reason: '', amount: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                onSubmit({
                    reason: values.reason,
                    amount: Number(values.amount),
                    imageUrl: photo
                });
            }}
        >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <>
                    <TextInput
                        mode="outlined"
                        label="Motivo"
                        value={values.reason}
                        onChangeText={handleChange('reason')}
                        onBlur={handleBlur('reason')}
                        error={touched.reason && !!errors.reason}
                        style={styles.input}
                    />
                    {touched.reason && errors.reason && <HelperText type="error">{errors.reason}</HelperText>}

                    <TextInput
                        mode="outlined"
                        label="Costo ($)"
                        value={values.amount}
                        onChangeText={handleChange('amount')}
                        onBlur={handleBlur('amount')}
                        keyboardType="numeric"
                        error={touched.amount && !!errors.amount}
                        style={styles.input}
                        left={<TextInput.Affix text="$" />}
                    />
                    {touched.amount && errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

                    <View style={styles.photoContainer}>
                        {uploadingPhoto ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator animating={true} />
                                <Text style={{marginLeft: 8}}>Subiendo foto...</Text>
                            </View>
                        ) : photo ? (
                            <View>
                                <Image source={{ uri: getFullImageUrl(photo) || undefined }} style={styles.previewImage} />
                                <IconButton icon="close-circle" size={20} style={styles.removePhoto} onPress={handleRemovePhoto} />
                            </View>
                        ) : (
                            <Button icon="camera" mode="outlined"
                                style={{ width: '100%' }}
                            onPress={() => setShowCamera(true)}>
                                Agregar Foto (Opcional)
                            </Button>
                        )}
                    </View>

                    <View style={styles.actions}>
                        <Button onPress={onDismiss} style={styles.button}>Cancelar</Button>
                        <Button mode="contained" onPress={() => handleSubmit()} loading={loading} style={styles.button}>
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
  },
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 12,
  },
  photoContainer: {
      alignItems: 'center',
      marginVertical: 12,
      width: '100%',

  },
  previewImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
  },
  removePhoto: {
      position: 'absolute',
      top: -10,
      right: -10,
      backgroundColor: 'white',
  },
  uploadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: 10,
  }
});
