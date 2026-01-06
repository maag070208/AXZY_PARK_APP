import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { Text, Button, ActivityIndicator, IconButton, Surface } from 'react-native-paper';
import CameraComponent from '../../../../shared/components/Camera';
import { uploadFile } from '../../services/EntriesService';
import { useAppDispatch } from '../../../../core/store/hooks';
import { showToast } from '../../../../core/store/slices/toast.slice';
import { getFullImageUrl } from '../../../../core/utils/imageUtils';

interface Props {
  title: string;
  categories: { key: string; label: string }[];
  formik: any;
}

export const PhotoUploadStep = ({ title, categories, formik }: Props) => {
  const dispatch = useAppDispatch();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const handlePhotoTaken = async (photo: { uri: string; path: string }) => {
    setShowCamera(false);
    if (!activeCategory) return;

    setUploading(activeCategory);
    try {
        const res = await uploadFile({
            uri: photo.uri,
            type: 'image/jpeg',
            fileName: `${activeCategory}_${Date.now()}.jpg`
        });

        if (res && res.data && res.data.url) {
            formik.setFieldValue(`photos.${activeCategory}`, res.data.url);
        } else {
            dispatch(showToast({ type: 'error', message: 'Error al subir imagen' }));
        }
    } catch (error) {
        dispatch(showToast({ type: 'error', message: 'Error de conexión' }));
    } finally {
        setUploading(null);
        setActiveCategory(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>{title}</Text>

      <View style={styles.grid}>
          {categories.map((cat) => {
              const photoUrl = formik.values.photos?.[cat.key];
              const isUploading = uploading === cat.key;

              return (
                  <Surface key={cat.key} style={styles.card} elevation={2}>
                      <TouchableOpacity 
                        style={styles.touchable}
                        onPress={() => {
                            setActiveCategory(cat.key);
                            setShowCamera(true);
                        }}
                        disabled={isUploading}
                      >
                          {isUploading ? (
                              <View style={styles.placeholder}>
                                  <ActivityIndicator animating={true} color="#3b82f6" />
                              </View>
                          ) : photoUrl ? (
                              <Image source={{ uri: getFullImageUrl(photoUrl) || undefined }} style={styles.image} />
                          ) : (
                              <View style={styles.placeholder}>
                                  <IconButton icon="camera-plus" size={32} iconColor="#94a3b8" />
                                  <Text style={styles.placeholderText}>Capturar</Text>
                              </View>
                          )}
                          
                          <View style={styles.labelContainer}>
                                <Text style={styles.label}>{cat.label}</Text>
                                {photoUrl && <IconButton icon="check-circle" size={16} iconColor="#10b981" style={{ margin: 0 }} />}
                          </View>
                      </TouchableOpacity>
                  </Surface>
              );
          })}
      </View>

      <Modal visible={showCamera} animationType="slide">
          <CameraComponent 
            onPhotoTaken={handlePhotoTaken} 
            onCancel={() => {
                setShowCamera(false);
                setActiveCategory(null);
            }} 
          />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
      fontWeight: 'bold',
      color: '#1e293b',
  },
  subtitle: {
      color: '#64748b',
      marginBottom: 20,
  },
  grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between', 
  },
  card: {
      width: '48%', 
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: '#fff',
      overflow: 'hidden',
  },
  touchable: {
      width: '100%',
  },
  placeholder: {
      width: '100%',
      height: 140,
      backgroundColor: '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
  },
  placeholderText: {
      marginTop: 4,
      color: '#94a3b8',
      fontWeight: '600',
  },
  image: {
      width: '100%',
      height: 140,
      resizeMode: 'cover',
  },
  labelContainer: {
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
  },
  label: {
      fontWeight: '600',
      color: '#334155',
      fontSize: 13,
  }
});
