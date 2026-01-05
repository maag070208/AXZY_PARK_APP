import { RouteProp, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, FAB, Icon, Surface, Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../core/store/hooks';
import { VehicleEntry } from '../../../core/types/VehicleEntry';
import { getFullImageUrl } from '../../../core/utils/imageUtils';
import ModernStyles from '../../../shared/theme/app.styles';
import { AddExtraCostModal } from '../components/AddExtraCostModal';
import { createExtraCost, getEntryById, finishKeyAssignment } from '../services/EntriesService';
import { createExit } from '../../exits/services/ExitsService';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type EntryDetailRouteProp = RouteProp<{ params: { id: number } }, 'params'>;

export const EntryDetailScreen = () => {
  const route = useRoute<EntryDetailRouteProp>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [entry, setEntry] = useState<VehicleEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Todo: Get real operator ID from context
  const operatorId  = useAppSelector((state) => state.userState.id);

  const handleAddExtraCost = async (data: any) => {
      if (!entry) return;
      setSubmitting(true);
      try {
          await createExtraCost({
              ...data,
              entryId: entry.id,
              userId: entry.userId, // Owner
              operatorId: operatorId 
          });
          setModalVisible(false);
          fetchEntry(); // Refresh
      } catch (error) {
          console.error(error);
          // show toast
      } finally {
          setSubmitting(false);
      }
  };

  const handleFinishAssignment = async (assignmentId: number) => {
      Alert.alert(
          "Finalizar Entrega",
          "¿Confirmar que el vehículo ha sido entregado al cliente?",
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Confirmar Entrega", 
                  onPress: async () => {
                      setSubmitting(true);
                      try {
                          await finishKeyAssignment(assignmentId);
                          fetchEntry();
                      } catch (error) {
                          console.error(error);
                          Alert.alert("Error", "No se pudo finalizar la entrega.");
                      } finally {
                        setSubmitting(false);
                      }
                  } 
              }
          ]
      );
  };

  const fetchEntry = async () => {
    try {
      const res = await getEntryById(id);
      console.log(res);
      if (res && res.data) {
        setEntry(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  if (!entry) {
    return (
      <View style={styles.container}>
        <Text>No se encontró la entrada.</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <Surface style={styles.headerCard} elevation={2}>
         <View style={styles.plateRow}>
             <Icon source="ticket-confirmation" size={28} color="#1e293b" />
             <Text variant="displaySmall" style={styles.plate}>{entry.entryNumber}</Text> 
             <View style={[styles.statusBadge, { backgroundColor: entry.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9' }]}>
                 <Text style={[styles.statusText, { color: entry.status === 'ACTIVE' ? '#166534' : '#64748b' }]}>
                    {entry.status === 'ACTIVE' ? 'ACTIVO' : 
                     entry.status === 'MOVED' ? 'MOVIDO' : 
                     entry.status === 'EXITED' ? 'SALIDA' : 
                     entry.status === 'CANCELLED' ? 'CANCELADO' : entry.status}
                 </Text>
             </View>
         </View>
         
         {/* Client Info */}
         <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{entry.user?.name} {entry.user?.lastName}</Text>
            <Text variant="bodySmall" style={{ color: '#64748b' }}>Cliente</Text>
         </View>

         <Text variant="titleMedium" style={styles.subtitle}>{entry.brand} {entry.model} • {entry.color}</Text>
         {entry.plates && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Icon source="card-text-outline" size={16} color="#64748b" />
                <Text style={{ marginLeft: 4, color: '#64748b', fontWeight: 'bold' }}>{entry.plates}</Text>
            </View>
         )}
         <Text variant="bodySmall" style={styles.date}>{dayjs(entry.entryDate).format('DD MMM YYYY, HH:mm')}</Text>
         
         {(() => {
             const days = Math.max(1, Math.ceil(dayjs().diff(dayjs(entry.entryDate), 'hour') / 24));
             const extras = entry.extraCosts?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
             const total = (days * 60) + extras;
             return (
                <Text variant="headlineMedium" style={{ marginTop: 12, fontWeight: 'bold', color: '#166534' }}>
                    Total: ${total.toFixed(2)}
                </Text>
             );
         })()}
      </Surface>

      {/* Location */}
      {entry.locationId && (
        <Card style={styles.sectionCard}>
            <Card.Title 
                title={`Ubicación Actual: ${entry.assignments?.filter((a:any) => {
                  return a.targetLocationId === entry.locationId;
                })?.[0]?.targetLocation?.name || 'Ubicación Desconocida'}`} 
                left={(props) => <Avatar.Icon {...props} icon="map-marker" style={{ backgroundColor: '#eff6ff' }} color="#3b82f6" />}
            />
        </Card>
      )}

      {/* Timeline Section */}
      {entry.assignments && entry.assignments.length > 0 && (
          <View style={styles.sectionContainer}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Historial de Movimientos</Text>
              <Surface style={styles.timelineCard} elevation={1}>
                  {entry.assignments.map((assignment, index) => (
                      <View key={assignment.id} style={styles.timelineItem}>
                          <View style={styles.timelineLeft}>
                              <View style={[styles.timelineDot, { backgroundColor: assignment.type === 'MOVEMENT' ? '#3b82f6' : '#22c55e' }]} />
                              {index < (entry.assignments || []).length - 1 && <View style={styles.timelineLine} />}
                          </View>
                          <View style={styles.timelineContent}>
                                <Text style={styles.timelineTime}>{dayjs(assignment.createdAt).format('DD MMM, HH:mm')}</Text>
                                <Text style={styles.timelineTitle}>
                                    {assignment.type === 'MOVEMENT' ? 'Movimiento de Vehículo' : 'Entrega de Vehículo'}
                                </Text>
                                <Text style={styles.timelineDescription}>
                                    {assignment.type === 'MOVEMENT' 
                                        ? `Movido a ${assignment.targetLocation?.name || 'Ubicación Desconocida'}` 
                                        : 'Vehículo entregado al cliente'}
                                </Text>
                                <View style={styles.operatorRow}>
                                    <Avatar.Icon size={24} icon="account" style={{ backgroundColor: '#f1f5f9' }} color="#64748b" />
                                    <Text style={styles.operatorName}>
                                        {assignment.operator ? `${assignment.operator.name} ${assignment.operator.lastName || ''}` : 'Operador'}
                                    </Text>
                                </View>
                          </View>
                      </View>
                  ))}
              </Surface>
          </View>
      )}

      {/* Extra Costs Section */}
      <View style={styles.sectionContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Costos Extras</Text>
          {entry?.extraCosts && entry.extraCosts.length > 0 ? (
              <View>
                  {entry.extraCosts.map((cost) => (
                      <Surface key={cost.id} style={styles.costCard} elevation={1}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                               <Avatar.Icon size={40} icon="cash-plus" style={{ backgroundColor: '#fff7ed' }} color="#ea580c" />
                               <View style={{ marginLeft: 12, flex: 1 }}>
                                   <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1e293b' }}>{cost.reason}</Text>
                                   <Text variant="bodySmall" style={{ color: '#64748b' }}>
                                       Por: {cost.operator?.name || 'Operador'} • {dayjs(cost.createdAt).format('DD MMM, HH:mm')}
                                   </Text>
                               </View>
                               <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#ea580c' }}>${cost.amount}</Text>
                          </View>
                          {cost.imageUrl && (
                               <Card.Cover source={{ uri: getFullImageUrl(cost.imageUrl) || undefined }} style={{ marginTop: 12, height: 150, borderRadius: 8 }} />
                          )}
                      </Surface>
                  ))}
              </View>
          ) : (
              <Text style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 }}>No hay costos extras registrados.</Text>
          )}
      </View>

      {/* Evidencias (Previous Photos Section) */}
      <View style={[styles.sectionContainer, { paddingBottom: 100 }]}>
           <Text variant="titleMedium" style={styles.sectionTitle}>Evidencias de Entrada</Text>
           <View style={styles.photoGrid}>
               {entry?.photos?.map((photo, index) => (
                   <View key={photo.id || index} style={styles.photoItem}>
                       <Card.Cover source={{ uri: getFullImageUrl(photo.imageUrl) || undefined }} style={styles.photo} />
                       <Text style={styles.photoLabel}>
                           {photo.category === 'extra' && photo.description 
                               ? photo.description 
                               : photo.category.replace('_', ' ')}
                       </Text>
                   </View>
               ))}
           </View>
      </View>

        {entry.assignments?.find((a: any) => a.status === 'ACTIVE' && a.type === 'DELIVERY') && (
            <View style={{ padding: 16, marginBottom:70 }}>
               <Button 
                    mode="contained-tonal" 
                    icon="check-circle"
                    buttonColor="#dcfce7"
                    textColor="#166534"
                    onPress={() => handleFinishAssignment(entry.assignments!.find((a: any) => a.status === 'ACTIVE' && a.type === 'DELIVERY')!.id)}
                    loading={submitting}
                    disabled={submitting}
                    contentStyle={{ height: 50 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
               >
                   Terminar Entrega
               </Button>
            </View>
        )}

  

    </ScrollView>

    {(entry.status === "ACTIVE" || entry.status === "MOVED") && (
        <FAB
            icon="cash-plus"
            label="Agregar Costo"
            style={[styles.fab, { bottom: insets.bottom + 16 }]}
            onPress={() => setModalVisible(true)}
        />
    )}

    <AddExtraCostModal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)} 
        onSubmit={handleAddExtraCost}
        loading={submitting}
    />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  headerCard: {
      padding: 20,
      backgroundColor: '#fff',
      paddingTop: 40,
      paddingBottom: 30,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      marginBottom: 20,
      alignItems: 'center',
  },
  plateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
  },
  plate: {
      fontWeight: '900',
      color: '#1e293b',
      letterSpacing: 1,
  },
  statusBadge: {
      backgroundColor: '#dcfce7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
  },
  statusText: {
      color: '#166534',
      fontWeight: 'bold',
      fontSize: 12,
  },
  subtitle: {
      color: '#475569',
      marginBottom: 4,
  },
  date: {
      color: '#94a3b8',
  },
  sectionCard: {
      marginHorizontal: 16,
      marginBottom: 20,
      backgroundColor: '#fff',
      borderRadius: 16,
      ...ModernStyles.shadowSm,
  },
  sectionContainer: {
      marginHorizontal: 16,
      marginBottom: 24,
  },
  sectionTitle: {
      fontWeight: 'bold',
      color: '#334155',
      marginBottom: 12,
      marginLeft: 4,
  },
  timelineCard: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 20,
  },
  timelineItem: {
      flexDirection: 'row',
      marginBottom: 24,
  },
  timelineLeft: {
      alignItems: 'center',
      marginRight: 16,
      width: 20,
  },
  timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      zIndex: 1,
  },
  timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: '#e2e8f0',
      marginTop: 4,
  },
  timelineContent: {
      flex: 1,
  },
  timelineTime: {
      fontSize: 12,
      color: '#94a3b8',
      marginBottom: 2,
  },
  timelineTitle: {
      fontWeight: 'bold',
      color: '#1e293b',
      fontSize: 16,
      marginBottom: 4,
  },
  timelineDescription: {
      color: '#475569',
      fontSize: 14,
      marginBottom: 8,
  },
  operatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  operatorName: {
      fontSize: 12,
      fontWeight: '500',
      color: '#64748b',
  },
  photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
  },
  photoItem: {
      width: '48%',
      marginBottom: 12,
  },
  photo: {
      height: 120,
      borderRadius: 12,
  },
  photoLabel: {
      marginTop: 4,
      fontSize: 12,
      color: '#64748b',
      textAlign: 'center',
      textTransform: 'capitalize',
  },
  costCard: {
      backgroundColor: 'white',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    backgroundColor: '#eaeaeaff', // Orange/Amber
  },
  paymentCard: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 16,
  },
  paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  paymentLabel: {
      fontSize: 16,
      color: '#64748b',
  },
  paymentValue: {
      fontSize: 16,
      color: '#1e293b',
      fontWeight: '500',
  },
  paymentTotalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1e293b',
  },
  paymentTotalValue: {
      fontSize: 24,
      fontWeight: '900',
      color: '#166534', // Green
  },
});
