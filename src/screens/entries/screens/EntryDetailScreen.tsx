import { RouteProp, useRoute } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, FAB, Icon, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../core/store/hooks';
import { VehicleEntry } from '../../../core/types/VehicleEntry';
import { getFullImageUrl } from '../../../core/utils/imageUtils';
import { getSystemConfig } from '../../config/services/ConfigService';
import { AddExtraCostModal } from '../components/AddExtraCostModal';
import { FinishDeliveryModal } from '../components/FinishDeliveryModal';
import { createExtraCost, finishKeyAssignment, getEntryById } from '../services/EntriesService';

type EntryDetailRouteProp = RouteProp<{ params: { id: number } }, 'params'>;

export const EntryDetailScreen = () => {
  const route = useRoute<EntryDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const { role } = useAppSelector(state => state.userState);
  const [entry, setEntry] = useState<VehicleEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Config state
  const [dayCost, setDayCost] = useState(60); // Default

  useEffect(() => {
    fetchEntry();
    fetchConfig();
  }, [id]);

  const [modalVisible, setModalVisible] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [targetAssignmentId, setTargetAssignmentId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const operatorId = useAppSelector((state) => state.userState.id);

  const fetchConfig = async () => {
    try {
      const res = await getSystemConfig();
      if (res.success && res.data) {
        setDayCost(res.data.dayCost || 60);
      }
    } catch (e) { console.error(e); }
  };

  const handleAddExtraCost = async (data: any) => {
    if (!entry) return;
    setSubmitting(true);
    try {
      await createExtraCost({
        ...data,
        entryId: entry.id,
        userId: entry.userId,
        operatorId: operatorId 
      });
      setModalVisible(false);
      fetchEntry();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishAssignment = (assignmentId: number) => {
    setTargetAssignmentId(assignmentId);
    setFinishModalVisible(true);
  };

  const confirmFinishAssignment = async () => {
    if (!targetAssignmentId) return;
    setSubmitting(true);
    try {
      await finishKeyAssignment(targetAssignmentId);
      setFinishModalVisible(false);
      fetchEntry();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo finalizar la entrega.");
    } finally {
      setSubmitting(false);
    }
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

  // Filtrar fotos por categoría
  const entryPhotos = entry?.photos?.filter(photo => 
    photo.category !== 'extra' && photo.category !== 'belongings'
  ) || [];

  const extraPhotos = entry?.photos?.filter(photo => 
    photo.category === 'extra' || photo.category === 'belongings'
  ) || [];

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.emptyContainer}>
        <Icon source="alert-circle-outline" size={48} color="#64748B" />
        <Text style={styles.emptyTitle}>No se encontró la entrada</Text>
        <Text style={styles.emptySubtitle}>La información solicitada no está disponible</Text>
      </View>
    );
  }


  // Calcular totales
  const days = Math.max(1, Math.ceil(dayjs().diff(dayjs(entry.entryDate), 'hour') / 24));
  const extras = entry.extraCosts?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  
  // Use specific vehicle type cost if available, else system config dayCost
  const currentDayCost = entry.vehicleType?.cost || dayCost || 60;
  const total = (days * currentDayCost) + extras;

  return (
    <>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Info */}
        <View style={styles.headerWrapper}>
          <Surface style={styles.headerCard} elevation={2}>
            <View style={styles.plateRow}>
              <View style={styles.plateContainer}>
                <Icon source="ticket-confirmation" size={24} color="#3B82F6" />
                <Text variant="headlineLarge" style={styles.plate}>
                  {entry.entryNumber}
                </Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: entry.status === 'ACTIVE' ? '#DCFCE7' : 
                  entry.status === 'MOVED' ? '#FEF3C7' : 
                  entry.status === 'EXITED' ? '#DBEAFE' : 
                  entry.status === 'CANCELLED' ? '#FEE2E2' : '#F1F5F9' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: entry.status === 'ACTIVE' ? '#166534' : 
                    entry.status === 'MOVED' ? '#92400E' : 
                    entry.status === 'EXITED' ? '#1E40AF' : 
                    entry.status === 'CANCELLED' ? '#DC2626' : '#64748B' }
                ]}>
                  {entry.status === 'ACTIVE' ? 'ACTIVO' : 
                   entry.status === 'MOVED' ? 'MOVIDO' : 
                   entry.status === 'EXITED' ? 'SALIDA' : 
                   entry.status === 'CANCELLED' ? 'CANCELADO' : entry.status}
                </Text>
              </View>
            </View>
            
            {/* Client Info */}
            <View style={styles.clientInfo}>
              <Avatar.Icon 
                size={48} 
                icon="account" 
                style={styles.clientAvatar}
                color="#3B82F6"
              />
              <View style={styles.clientDetails}>
                <Text variant="titleLarge" style={styles.clientName}>
                  {entry.user?.name} {entry.user?.lastName}
                </Text>
                <Text style={styles.clientLabel}>Cliente</Text>
              </View>
            </View>

            {/* Vehicle Info */}
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleRow}>
                <Icon source="car" size={20} color="#64748B" />
                <Text style={styles.vehicleText}>
                  {entry.brand} {entry.model} • {entry.color}
                </Text>
              </View>
              {entry.plates && (
                <View style={styles.plateRow2}>
                  <Icon source="card-text-outline" size={18} color="#64748B" />
                  <Text style={styles.plateText}>{entry.plates}</Text>
                </View>
              )}
              <View style={styles.dateRow}>
                <Icon source="calendar" size={18} color="#64748B" />
                <Text style={styles.dateText}>
                  {dayjs(entry.entryDate).format('DD MMM YYYY, HH:mm')}
                </Text>
              </View>
            </View>

            {/* Total Section */}
            <View style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Estimado:</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownText}>
                  ({days} días × ${currentDayCost} + ${extras.toFixed(2)} extras)
                </Text>
              </View>
            </View>
          </Surface>
        </View>

        {/* Location Card */}
        {entry.locationId && (
          <Card style={styles.locationCard}>
            <Card.Content style={styles.locationContent}>
              <View style={styles.locationHeader}>
                <Avatar.Icon size={40} icon="map-marker" style={styles.locationIcon} />
                <View style={styles.locationInfo}>
                  <Text variant="titleMedium" style={styles.locationTitle}>
                    Ubicación Actual
                  </Text>
                  <Text variant="bodyLarge" style={styles.locationName}>
                    {entry.assignments?.filter((a: any) => 
                      a.targetLocationId === entry.locationId
                    )?.[0]?.targetLocation?.name || 'Ubicación Desconocida'}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Timeline Section */}
        {entry.assignments && entry.assignments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Historial de Movimientos
              </Text>
              <View style={styles.sectionLine} />
            </View>
            <Surface style={styles.timelineCard}>
              {entry.assignments.map((assignment, index) => (
                <View key={assignment.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot,
                      { backgroundColor: assignment.type === 'MOVEMENT' ? '#3B82F6' : '#10B981' }
                    ]} />
                    {index < entry.assignments!.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTime}>
                      {dayjs(assignment.createdAt).format('DD MMM, HH:mm')}
                    </Text>
                    <Text style={styles.timelineTitle}>
                      {assignment.type === 'MOVEMENT' ? 'Movimiento de Vehículo' : 'Entrega de Vehículo'}
                    </Text>
                    <Text style={styles.timelineDescription}>
                      {assignment.type === 'MOVEMENT' 
                        ? `Movido a ${assignment.targetLocation?.name || 'Ubicación Desconocida'}`
                        : 'Vehículo entregado al cliente'}
                    </Text>
                    <View style={styles.operatorRow}>
                      <Avatar.Icon size={24} icon="account" style={styles.operatorAvatar} />
                      <Text style={styles.operatorName}>
                        {assignment.operator 
                          ? `${assignment.operator.name} ${assignment.operator.lastName || ''}`
                          : 'Operador'
                        }
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Surface>
          </View>
        )}

        {/* Extra Costs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Costos Extras
            </Text>
            <View style={styles.sectionLine} />
          </View>
          {entry?.extraCosts && entry.extraCosts.length > 0 ? (
            <View style={styles.costsGrid}>
              {entry.extraCosts.map((cost) => (
                <Card key={cost.id} style={styles.costCard}>
                  <Card.Content>
                    <View style={styles.costHeader}>
                      <Avatar.Icon size={44} icon="cash-plus" style={styles.costIcon} />
                      <View style={styles.costInfo}>
                        <Text variant="titleMedium" style={styles.costTitle}>
                          {cost.reason}
                        </Text>
                        <Text variant="bodySmall" style={styles.costMeta}>
                          Por: {cost.operator?.name || 'Operador'} • {dayjs(cost.createdAt).format('DD MMM, HH:mm')}
                        </Text>
                      </View>
                      <Text variant="titleLarge" style={styles.costAmount}>
                        ${cost.amount}
                      </Text>
                    </View>
                    {cost.imageUrl && (
                      <Card.Cover 
                        source={{ uri: getFullImageUrl(cost.imageUrl) || undefined }} 
                        style={styles.costImage}
                      />
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Icon source="cash-remove" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No hay costos extras registrados</Text>
            </View>
          )}
        </View>

        {/* Entry Evidence Photos */}
        {entryPhotos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Evidencias de Entrada
              </Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.photoGrid}>
              {entryPhotos.map((photo, index) => (
                <View key={photo.id || index} style={styles.photoCard}>
                  <Card.Cover 
                    source={{ uri: getFullImageUrl(photo.imageUrl) || undefined }} 
                    style={styles.photo}
                  />
                  <View style={styles.photoLabelContainer}>
                    <Text style={styles.photoLabel}>
                      {photo.category === 'extra' && photo.description 
                        ? photo.description 
                        : photo.category?.replace('_', ' ') || 'Foto'}
                    </Text>
                    {photo.category === 'extra' && (
                      <Icon source="star-circle" size={16} color="#F59E0B" />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Belongings/Extras Photos */}
        {extraPhotos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Pertenencias y Objetos Dejados
              </Text>
              <View style={styles.sectionLine} />
              <View style={styles.warningBadge}>
                <Icon source="alert" size={16} color="#92400E" />
                <Text style={styles.warningText}>Artículos del cliente</Text>
              </View>
            </View>
            <View style={styles.belongingsGrid}>
              {extraPhotos.map((photo, index) => (
                <Card key={photo.id || index} style={styles.belongingCard}>
                  <Card.Cover 
                    source={{ uri: getFullImageUrl(photo.imageUrl) || undefined }} 
                    style={styles.belongingPhoto}
                  />
                  <Card.Content style={styles.belongingContent}>
                    <View style={styles.belongingHeader}>
                      <Icon source="package-variant" size={20} color="#7C3AED" />
                      <Text style={styles.belongingTitle}>Pertenencias</Text>
                    </View>
                    <Text style={styles.belongingDescription}>
                      {photo.description || 'Objeto dejado por el cliente'}
                    </Text>
                    <View style={styles.noteBadge}>
                      <Icon source="information" size={14} color="#3B82F6" />
                      <Text style={styles.noteText}>Conservar hasta entrega</Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Finish Delivery Button */}
        {entry.assignments?.find((a: any) => a.status === 'ACTIVE' && a.type === 'DELIVERY') && role !== 'CLIENT' && role !== 'USER' && (
          <View style={styles.finishContainer}>
            <Card style={styles.finishCard}>
              <Card.Content style={styles.finishContent}>
                <View style={styles.finishHeader}>
                  <Icon source="check-circle-outline" size={32} color="#10B981" />
                  <View style={styles.finishTexts}>
                    <Text variant="titleLarge" style={styles.finishTitle}>
                      Entrega Pendiente
                    </Text>
                    <Text variant="bodyMedium" style={styles.finishSubtitle}>
                      El vehículo está listo para ser entregado al cliente
                    </Text>
                  </View>
                </View>
                <Button
                  mode="contained"
                  icon="check-circle"
                  onPress={() => handleFinishAssignment(
                    entry.assignments!.find((a: any) => a.status === 'ACTIVE' && a.type === 'DELIVERY')!.id
                  )}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.finishButton}
                  contentStyle={styles.finishButtonContent}
                  labelStyle={styles.finishButtonLabel}
                >
                  Terminar Entrega
                </Button>
              </Card.Content>
            </Card>
          </View>
        )}

        {/* Spacer for FAB */}
        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* FAB for Adding Extra Cost */}
      {(entry.status === "ACTIVE" || entry.status === "MOVED") && role !== 'USER' && (
        <FAB
          icon="cash-plus"
          label="Agregar Costo"
          style={[
            styles.fab,
            { 
              bottom: insets.bottom + (entry.assignments?.find((a: any) => a.status === 'ACTIVE' && a.type === 'DELIVERY') ? 100 : 20)
            }
          ]}
          onPress={() => setModalVisible(true)}
          color="#FFFFFF"
        />
      )}

      {/* Modals */}
      <AddExtraCostModal 
        visible={modalVisible} 
        onDismiss={() => setModalVisible(false)} 
        onSubmit={handleAddExtraCost}
        loading={submitting}
      />
      
      {entry && (
        <FinishDeliveryModal
          visible={finishModalVisible}
          onDismiss={() => setFinishModalVisible(false)}
          onConfirm={confirmFinishAssignment}
          entry={entry}
          dayCost={currentDayCost}
          loading={submitting}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 120, // Space for FAB and finish button
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  plateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  plate: {
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
  },
  clientAvatar: {
    backgroundColor: '#EFF6FF',
  },
  clientDetails: {
    marginLeft: 16,
    flex: 1,
  },
  clientName: {
    fontWeight: '700',
    color: '#1E293B',
  },
  clientLabel: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 2,
  },
  vehicleInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  plateRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  plateText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 12,
  },
  totalCard: {
    backgroundColor: '#10B981',
    padding: 20,
    borderRadius: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  breakdownRow: {
    marginTop: 4,
  },
  breakdownText: {
    color: '#D1FAE5',
    fontSize: 12,
    opacity: 0.9,
  },
  locationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationContent: {
    padding: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    backgroundColor: '#EFF6FF',
  },
  locationInfo: {
    marginLeft: 16,
    flex: 1,
  },
  locationTitle: {
    color: '#64748B',
    fontSize: 14,
  },
  locationName: {
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    fontSize: 20,
  },
  sectionLine: {
    height: 3,
    width: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
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
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '500',
  },
  timelineTitle: {
    fontWeight: '600',
    color: '#1E293B',
    fontSize: 16,
    marginBottom: 4,
  },
  timelineDescription: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  operatorAvatar: {
    backgroundColor: '#F1F5F9',
    width: 24,
    height: 24,
  },
  operatorName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  costsGrid: {
    gap: 12,
  },
  costCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  costIcon: {
    backgroundColor: '#FEF3C7',
  },
  costInfo: {
    marginLeft: 12,
    flex: 1,
  },
  costTitle: {
    fontWeight: '600',
    color: '#1E293B',
    fontSize: 16,
  },
  costMeta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  costAmount: {
    fontWeight: '700',
    color: '#D97706',
    fontSize: 20,
  },
  costImage: {
    height: 150,
    borderRadius: 12,
    marginTop: 12,
  },
  emptySection: {
    backgroundColor: '#FFFFFF',
    padding: 48,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    marginBottom: 12,
  },
  photo: {
    height: 140,
    borderRadius: 12,
  },
  photoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  photoLabel: {
    fontSize: 12,
    color: '#64748B',
    textTransform: 'capitalize',
    flex: 1,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 6,
  },
  warningText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
  },
  belongingsGrid: {
    gap: 16,
  },
  belongingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  belongingPhoto: {
    height: 180,
    borderRadius: 12,
    margin: 12,
  },
  belongingContent: {
    padding: 16,
    paddingTop: 0,
  },
  belongingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  belongingTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '600',
  },
  belongingDescription: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  noteText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '500',
  },
  finishContainer: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  finishCard: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    overflow: 'hidden',
  },
  finishContent: {
    padding: 24,
  },
  finishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  finishTexts: {
    marginLeft: 16,
    flex: 1,
  },
  finishTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  finishSubtitle: {
    color: '#D1FAE5',
    fontSize: 14,
    marginTop: 4,
  },
  finishButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonContent: {
    height: 56,
  },
  finishButtonLabel: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
  },
  fabSpacer: {
    height: 100, // Extra space at bottom for FAB
  },
  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});