import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { TextInput, Text, Button, Card, IconButton, HelperText, ActivityIndicator } from 'react-native-paper';
import CameraComponent from '../../../../shared/components/Camera';
import { useAppDispatch } from '../../../../core/store/hooks';
import { showToast } from '../../../../core/store/slices/toast.slice';
import { uploadFile } from '../../services/EntriesService';
import { getFullImageUrl } from '../../../../core/utils/imageUtils';

interface ExtraItem {
  id: string;
  imageUrl: string;
  description: string;
}

interface Props {
  formik: any;
}

export const ExtrasStep = ({ formik }: Props) => {
  const dispatch = useAppDispatch();
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [description, setDescription] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const handlePhotoTaken = async (photo: { uri: string; path: string }) => {
      setShowCamera(false);
      setUploading(true);

      try {
          const res = await uploadFile({
              uri: photo.uri,
              type: 'image/jpeg',
              fileName: `extra_${Date.now()}.jpg`
          });

          if (res && res.data && res.data.url) {
              const newExtra: ExtraItem = {
                  id: Date.now().toString(),
                  imageUrl: res.data.url,
                  description: description || 'Sin descripción'
              };
              
              const updatedExtras = [...extras, newExtra];
              setExtras(updatedExtras);
              setDescription(''); // Reset input
              
              formik.setFieldValue('extrasList', updatedExtras);
          } else {
              dispatch(showToast({ type: 'error', message: 'Error al subir imagen' }));
          }
      } catch (error) {
          dispatch(showToast({ type: 'error', message: 'Error de conexión' }));
      } finally {
          setUploading(false);
      }
  };

  const handleRemoveExtra = (id: string) => {
      const updated = extras.filter(e => e.id !== id);
      setExtras(updated);
      formik.setFieldValue('extrasList', updated);
  };

  return (
    <ScrollView style={styles.container}>
       <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Notas Generales</Text>
          <TextInput
            label="Observaciones generales de la entrada"
            value={formik.values.notes}
            onChangeText={formik.handleChange('notes')}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
       </View>

       <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Extras y Pertenencias</Text>
          <Text variant="bodySmall" style={styles.subtitle}>
              Agregue fotos y descripción de objetos de valor o situaciones especiales (ej. dinero en guantera, rayones específicos).
          </Text>

          <View style={styles.addExtraContainer}>
              <TextInput 
                  label="Descripción del extra (Opcional)"
                  value={description}
                  onChangeText={setDescription}
                  mode="outlined"
                  style={{ marginBottom: 12 }}
              />
              
              {uploading ? (
                   <View style={styles.uploadingContainer}>
                       <ActivityIndicator animating={true} />
                       <Text>Subiendo imagen...</Text>
                   </View>
              ) : (
                  <Button 
                    mode="contained-tonal" 
                    icon="camera" 
                    onPress={() => setShowCamera(true)}
                  >
                      Tomar Foto y Agregar
                  </Button>
              )}
          </View>

          {extras.map((item) => (
              <Card key={item.id} style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                      <Image source={{ uri: getFullImageUrl(item.imageUrl) || undefined }} style={styles.image} />
                      <View style={styles.textContainer}>
                          <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Extra</Text>
                          <Text variant="bodySmall">{item.description}</Text>
                      </View>
                      <IconButton icon="delete" iconColor="red" onPress={() => handleRemoveExtra(item.id)} />
                  </Card.Content>
              </Card>
          ))}
       </View>

       <Modal visible={showCamera} animationType="slide">
          <CameraComponent 
            onPhotoTaken={handlePhotoTaken} 
            onCancel={() => setShowCamera(false)} 
          />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#334155',
  },
  subtitle: {
    color: '#64748b',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  addExtraContainer: {
      backgroundColor: '#f8fafc',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0'
  },
  uploadingContainer: {
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 10, 
      padding: 10
  },
  card: {
      marginBottom: 12,
      backgroundColor: 'white',
      elevation: 2
  },
  cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8
  },
  image: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: '#eee'
  },
  textContainer: {
      flex: 1,
      marginLeft: 12
  }
});
