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
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>Nuevo Costo Extra</Text>
            <IconButton 
              icon="close" 
              size={24} 
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          <RNModal visible={showCamera} animationType="slide">
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
                      {/* Reason Input */}
                      <View style={styles.inputContainer}>
                        <TextInput
                            mode="outlined"
                            label="Motivo"
                            value={values.reason}
                            onChangeText={handleChange('reason')}
                            onBlur={handleBlur('reason')}
                            error={touched.reason && !!errors.reason}
                            style={styles.input}
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#3B82F6"
                            left={<TextInput.Icon icon="text" />}
                        />
                        {touched.reason && errors.reason && 
                          <HelperText type="error" style={styles.errorText}>{errors.reason}</HelperText>
                        }
                      </View>

                      {/* Amount Input */}
                      <View style={styles.inputContainer}>
                        <TextInput
                            mode="outlined"
                            label="Costo"
                            value={values.amount}
                            onChangeText={handleChange('amount')}
                            onBlur={handleBlur('amount')}
                            keyboardType="numeric"
                            error={touched.amount && !!errors.amount}
                            style={styles.input}
                            outlineColor="#E2E8F0"
                            activeOutlineColor="#3B82F6"
                            left={<TextInput.Affix text="$" />}
                        />
                        {touched.amount && errors.amount && 
                          <HelperText type="error" style={styles.errorText}>{errors.amount}</HelperText>
                        }
                      </View>

                      {/* Photo Section */}
                      <View style={styles.photoSection}>
                        <Text style={styles.photoLabel}>Foto de evidencia (opcional)</Text>
                        
                        {uploadingPhoto ? (
                            <View style={styles.uploadingContainer}>
                                <ActivityIndicator animating={true} color="#3B82F6" />
                                <Text style={styles.uploadingText}>Subiendo...</Text>
                            </View>
                        ) : photo ? (
                            <View style={styles.photoPreviewContainer}>
                                <View style={styles.photoCard}>
                                    <Image 
                                      source={{ uri: getFullImageUrl(photo) || undefined }} 
                                      style={styles.previewImage} 
                                    />
                                    <View style={styles.photoOverlay}>
                                      <IconButton 
                                        icon="close-circle" 
                                        size={24} 
                                        iconColor="#FFFFFF"
                                        style={styles.removePhotoButton}
                                        onPress={handleRemovePhoto}
                                      />
                                    </View>
                                </View>
                                <Button 
                                  mode="text" 
                                  icon="camera" 
                                  onPress={() => setShowCamera(true)}
                                  style={styles.changePhotoButton}
                                >
                                  Cambiar foto
                                </Button>
                            </View>
                        ) : (
                            <Button 
                              mode="outlined" 
                              icon="camera"
                              onPress={() => setShowCamera(true)}
                              style={styles.cameraButton}
                              contentStyle={styles.cameraButtonContent}
                            >
                              Tomar foto
                            </Button>
                        )}
                      </View>

                      {/* Actions */}
                      <View style={styles.actions}>
                          <Button 
                            mode="outlined" 
                            onPress={onDismiss} 
                            style={styles.cancelButton}
                            contentStyle={styles.buttonContent}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            mode="contained" 
                            onPress={() => handleSubmit()} 
                            loading={loading} 
                            style={styles.saveButton}
                            contentStyle={styles.buttonContent}
                          >
                            Guardar
                          </Button>
                      </View>
                  </>
              )}
          </Formik>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modal: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    fontSize: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
  photoSection: {
    marginBottom: 32,
  },
  photoLabel: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadingText: {
    marginLeft: 12,
    color: '#64748B',
    fontSize: 14,
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoCard: {
    position: 'relative',
    marginBottom: 12,
  },
  previewImage: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  removePhotoButton: {
    margin: 0,
  },
  changePhotoButton: {
    margin: 0,
  },
  cameraButton: {
    borderColor: '#3B82F6',
    borderWidth: 1.5,
    borderRadius: 12,
  },
  cameraButtonContent: {
    height: 48,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
});