import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Divider, Card, List, IconButton, Surface } from 'react-native-paper';
import { getFullImageUrl } from '../../../../core/utils/imageUtils';

interface Props {
  formik: any;
  locations: any[];
  vehicleTypes: any[];
}

export const ConfirmationStep = ({ formik, locations, vehicleTypes }: Props) => {
  const { brand, model, color, plates, mileage, notes, photos, locationId, vehicleTypeId } = formik.values;

  const getLocationName = () => {
      const loc = locations?.find(l => l.id == locationId);
      return loc ? loc.name : `Cajón ${locationId}`;
  };

  const getVehicleTypeName = () => {
      const type = vehicleTypes?.find(t => t.id == vehicleTypeId);
      return type ? type.name : '';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header */}
      <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Resumen de Entrada</Text>
          <Text style={styles.headerSubtitle}>Verifique los datos antes de finalizar</Text>
      </View>

      {/* Vehicle Info Card */}
      <Card style={styles.card} mode="elevated">
          <Card.Content>
              <View style={styles.row}>
                  <View style={styles.infoBlock}>
                      <Text style={styles.label}>Placas</Text>
                      <Text variant="titleLarge" style={styles.plate}>{plates || 'SIN PLACAS'}</Text>
                  </View>
                  <View style={styles.infoBlock}>
                      <Text style={styles.label}>Tipo</Text>
                      <Text variant="bodyLarge">{getVehicleTypeName()}</Text>
                  </View>
              </View>
              
              <Divider style={styles.divider} />

              <View style={styles.row}>
                  <View style={styles.infoBlock}>
                      <Text style={styles.label}>Marca</Text>
                      <Text variant="bodyLarge">{brand}</Text>
                  </View>
                  <View style={styles.infoBlock}>
                      <Text style={styles.label}>Color</Text>
                      <Text variant="bodyLarge">{color}</Text>
                  </View>
                  <View style={styles.infoBlock}>
                      <Text style={styles.label}>Modelo</Text>
                      <Text variant="bodyLarge">{model}</Text>
                  </View>
              </View>

              {mileage ? (
                  <>
                    <Divider style={styles.divider} />
                    <View style={styles.row}>
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>Kilometraje</Text>
                            <Text variant="bodyLarge">{mileage} km</Text>
                        </View>
                    </View>
                  </>
              ) : null}

              {notes ? (
                   <>
                    <Divider style={styles.divider} />
                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>Notas</Text>
                        <Text variant="bodyMedium">{notes}</Text>
                    </View>
                   </>
              ) : null}
          </Card.Content>
      </Card>

      {/* Location */}
      {locationId ? (
          <Surface style={styles.locationBanner} elevation={1}>
              <IconButton icon="map-marker" size={24} iconColor="#3b82f6" />
              <View>
                  <Text style={styles.label}>Ubicación Asignada</Text>
                  <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{getLocationName()}</Text>
              </View>
          </Surface>
      ) : null}

      {/* Photos */}
      <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Evidencias Fotográficas</Text>
          <View style={styles.photoGrid}>
              {/* Standard Photos */}
              {Object.entries(photos || {}).map(([key, url]) => {
                  if (!url) return null;
                  return (
                      <View key={key} style={styles.photoItem}>
                          <Image source={{ uri: getFullImageUrl(url as string) || undefined }} style={styles.photo} />
                          <View style={styles.photoBadge}>
                               <Text style={styles.photoLabel}>{key.replace('_', ' ')}</Text>
                          </View>
                      </View>
                  );
              })}

              {/* Extras Photos */}
              {formik.values.extrasList?.map((extra: any) => (
                   <View key={extra.id} style={styles.photoItem}>
                       <Image source={{ uri: getFullImageUrl(extra.imageUrl) || undefined }} style={styles.photo} />
                       <View style={[styles.photoBadge, { backgroundColor: 'rgba(234, 88, 12, 0.8)' }]}>
                            <Text style={styles.photoLabel}>Extra: {extra.description.substring(0, 15)}...</Text>
                       </View>
                   </View>
              ))}
          </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
      marginBottom: 20,
      marginTop: 10,
  },
  headerTitle: {
      fontWeight: 'bold',
      color: '#0f172a',
  },
  headerSubtitle: {
      color: '#64748b',
  },
  card: {
      backgroundColor: '#fff',
      marginBottom: 20,
      borderRadius: 16,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
  },
  infoBlock: {
      flex: 1,
  },
  label: {
      fontSize: 12,
      color: '#64748b',
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: 4,
  },
  plate: {
      fontWeight: 'bold',
      color: '#1e3a8a',
  },
  divider: {
      marginVertical: 12,
      backgroundColor: '#e2e8f0',
  },
  locationBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#eff6ff',
      padding: 12,
      borderRadius: 12,
      marginBottom: 24,
  },
  section: {
      marginBottom: 20,
  },
  sectionTitle: {
      fontWeight: 'bold',
      marginBottom: 12,
      color: '#334155',
  },
  photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
  },
  photoItem: {
      width: '48%', 
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#fff',
      elevation: 2,
  },
  photo: {
      width: '100%',
      aspectRatio: 4/3,
      resizeMode: 'cover',
  },
  photoBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingVertical: 6,
      paddingHorizontal: 8,
  },
  photoLabel: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'capitalize',
      textAlign: 'center',
  }
});
