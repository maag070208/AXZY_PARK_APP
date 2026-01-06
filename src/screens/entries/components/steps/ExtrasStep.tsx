import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text, TextInput } from 'react-native-paper';
import { useAppDispatch } from '../../../../core/store/hooks';
import { showToast } from '../../../../core/store/slices/toast.slice';
import { getFullImageUrl } from '../../../../core/utils/imageUtils';
import CameraComponent from '../../../../shared/components/Camera';
import { uploadFile } from '../../services/EntriesService';

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

      if (res?.data?.url) {
        const newExtra: ExtraItem = {
          id: Date.now().toString(),
          imageUrl: res.data.url,
          description: description || 'Sin descripción'
        };
        
        const updatedExtras = [...extras, newExtra];
        setExtras(updatedExtras);
        setDescription('');
        
        formik.setFieldValue('extrasList', updatedExtras);
        dispatch(showToast({ 
          type: 'success', 
          message: 'Extra agregado correctamente' 
        }));
      } else {
        dispatch(showToast({ 
          type: 'error', 
          message: 'Error al subir imagen' 
        }));
      }
    } catch (error) {
      dispatch(showToast({ 
        type: 'error', 
        message: 'Error de conexión' 
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveExtra = (id: string) => {
    const updated = extras.filter(e => e.id !== id);
    setExtras(updated);
    formik.setFieldValue('extrasList', updated);
    
    dispatch(showToast({
      type: 'info',
      message: 'Extra eliminado'
    }));
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Sección de Notas Generales */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Notas Generales
          </Text>
          <View style={styles.titleLine} />
        </View>
        
        <TextInput
          label="Observaciones generales de la entrada"
          value={formik.values.notes}
          onChangeText={formik.handleChange('notes')}
          mode="outlined"
          multiline
          numberOfLines={4}
          outlineColor="#E2E8F0"
          activeOutlineColor="#3B82F6"
          style={styles.textArea}
          theme={{ 
            colors: { 
              background: '#FFFFFF',
              onSurfaceVariant: '#64748B'
            } 
          }}
        />
      </View>

      {/* Sección de Extras */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Extras y Pertenencias
          </Text>
          <View style={styles.titleLine} />
        </View>
        
        <View style={styles.infoBox}>
          <IconButton 
            icon="information-outline" 
            size={20} 
            iconColor="#3B82F6"
            style={styles.infoIcon}
          />
          <Text variant="bodySmall" style={styles.infoText}>
            Agregue fotos y descripción de objetos de valor o situaciones especiales 
            (ej. dinero en guantera, rayones específicos).
          </Text>
        </View>

        {/* Formulario para agregar extras */}
        <View style={styles.addExtraCard}>
          <View style={styles.formHeader}>
            <Text variant="titleMedium" style={styles.formTitle}>
              Agregar Nuevo Extra
            </Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>Requerido</Text>
            </View>
          </View>
          
          <TextInput 
            label="Descripción del extra"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            placeholder="Describe el objeto o situación..."
            outlineColor="#E2E8F0"
            activeOutlineColor="#3B82F6"
            style={styles.input}
            theme={{ 
              colors: { 
                background: '#FFFFFF',
                onSurfaceVariant: '#64748B'
              } 
            }}
          />
          
          {uploading ? (
            <View style={styles.uploadingCard}>
              <ActivityIndicator 
                animating={true} 
                color="#3B82F6"
                size="large"
              />
              <Text style={styles.uploadingText}>
                Subiendo imagen...
              </Text>
            </View>
          ) : (
            <Button 
              mode="contained"
              icon="camera-plus"
              onPress={() => {
                if (!description.trim()) {
                  dispatch(showToast({ 
                    type: 'error', 
                    message: 'La descripción es obligatoria' 
                  }));
                  return;
                }
                setShowCamera(true);
              }}
              style={styles.cameraButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Tomar Foto
            </Button>
          )}
        </View>

        {/* Lista de extras */}
        {extras.length > 0 && (
          <View style={styles.extrasList}>
            <View style={styles.listHeader}>
              <Text variant="titleMedium" style={styles.listTitle}>
                Extras Agregados
              </Text>
              <Text style={styles.listCount}>
                {extras.length} {extras.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            
            {extras.map((item) => (
              <Card key={item.id} style={styles.extraCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: getFullImageUrl(item.imageUrl) || undefined }} 
                      style={styles.image} 
                    />
                    <View style={styles.imageBadge}>
                      <IconButton 
                        icon="image" 
                        size={12} 
                        iconColor="#FFFFFF"
                        style={styles.imageIcon}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.textContainer}>
                    <View style={styles.extraHeader}>
                      <Text variant="titleSmall" style={styles.extraTitle}>
                        Extra
                      </Text>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text variant="bodyMedium" style={styles.description}>
                      {item.description}
                    </Text>
                  </View>
                  
                  <IconButton 
                    icon="trash-can-outline" 
                    iconColor="#EF4444"
                    size={20}
                    onPress={() => handleRemoveExtra(item.id)}
                    style={styles.deleteButton}
                  />
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {extras.length === 0 && (
          <View style={styles.emptyState}>
            <IconButton 
              icon="image-multiple-outline" 
              size={48} 
              iconColor="#CBD5E1"
              style={styles.emptyIcon}
            />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No hay extras agregados
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Toma una foto para agregar tu primer extra
            </Text>
          </View>
        )}
      </View>

      <Modal 
        visible={showCamera} 
        animationType="slide"
        statusBarTranslucent
      >
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
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  titleLine: {
    height: 3,
    width: 40,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'flex-start',
  },
  infoIcon: {
    margin: 0,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    color: '#0C4A6E',
    fontSize: 13,
    lineHeight: 18,
  },
  addExtraCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    color: '#1E293B',
    fontWeight: '600',
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  requiredText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    borderRadius: 12,
    fontSize: 14,
  },
  uploadingCard: {
    backgroundColor: '#F8FAFC',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadingText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 14,
  },
  cameraButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 2,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  extrasList: {
    marginTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    color: '#1E293B',
    fontWeight: '600',
  },
  listCount: {
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  extraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  imageBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIcon: {
    margin: 0,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  extraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  extraTitle: {
    color: '#1E293B',
    fontWeight: '600',
  },
  dateBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateText: {
    color: '#0C4A6E',
    fontSize: 10,
    fontWeight: '500',
  },
  description: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  deleteButton: {
    margin: 0,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    margin: 0,
    marginBottom: 16,
  },
  emptyText: {
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#94A3B8',
    textAlign: 'center',
  },
});