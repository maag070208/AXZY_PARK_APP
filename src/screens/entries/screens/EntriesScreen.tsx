import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, FAB, Icon, Searchbar, Surface, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VehicleEntry } from '../../../core/types/VehicleEntry';
import LoaderComponent from '../../../shared/components/LoaderComponent';
import { ActionModal } from '../components/ActionModal';
import { finishKeyAssignment, getEntries, getUserVehicles } from '../services/EntriesService';
import { useAppSelector } from '../../../core/store/hooks';

export const EntriesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { role, id } = useAppSelector(state => state.userState);
  const [entries, setEntries] = useState<VehicleEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<VehicleEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionEntry, setActionEntry] = useState<VehicleEntry | null>(null);

  const loadEntries = async () => {
    try {

      console.log(role);

      const isClient = role === 'USER';
      if (isClient && !id) return;

      const result = isClient
        ? await getUserVehicles(Number(id))
        : await getEntries();
        
      console.log(result);  
      if (result && result.success && result.data) {
          setEntries(result.data);
          setFilteredEntries(result.data);
      } else {
          setEntries([]);
          setFilteredEntries([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onChangeSearch = (query: string) => {
      setSearchQuery(query);
      if (query) {
          const lower = query.toLowerCase();
          const filtered = entries.filter(item => 
              (item.entryNumber && String(item.entryNumber).toLowerCase().includes(lower)) ||
              (item.plates && item.plates.toLowerCase().includes(lower)) ||
              (item.brand && item.brand.toLowerCase().includes(lower)) ||
              (item.model && item.model.toLowerCase().includes(lower))
          );
          setFilteredEntries(filtered);
      } else {
          setFilteredEntries(entries);
      }
  };

  const handleFinishAssignment = async (assignment: any) => {
      Alert.alert(
          "Finalizar Acción",
          "¿Confirmar que se ha completado la acción?",
          [
              { text: "Cancelar", style: "cancel" },
              { 
                  text: "Confirmar", 
                  onPress: async () => {
                      setLoading(true); // temporary loader or toast
                      try {
                          await finishKeyAssignment(assignment.id);
                          loadEntries();
                      } catch (error) {
                          console.error(error);
                          Alert.alert("Error", "No se pudo finalizar la asignación.");
                      } finally {
                        setLoading(false);
                      }
                  } 
              }
          ]
      );
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'ACTIVE': return '#10b981'; // Green
          case 'MOVED': return '#f59e0b'; // Amber
          case 'EXITED': return '#64748b'; // Slate
          case 'CANCELLED': return '#ef4444'; // Red
          default: return '#3b82f6'; // Blue
      }
  };

  const getStatusLabel = (status: string) => {
      switch (status) {
          case 'ACTIVE': return 'Activo'; 
          case 'MOVED': return 'Movido'; 
          case 'EXITED': return 'Salida'; 
          case 'CANCELLED': return 'Cancelado'; 
          default: return status; 
      }
  };


  const getEntryWarningStyle = (entry: VehicleEntry) => {
      const costsCount = entry.extraCosts?.length || 0;
      if (costsCount >= 3) return { borderColor: '#ef4444', borderWidth: 2, backgroundColor: '#fef2f2' };
      if (costsCount >= 1) return { borderColor: '#f59e0b', borderWidth: 2, backgroundColor: '#fffbeb' };
      return {};
  };

  const renderItem = ({ item }: { item: VehicleEntry }) => {
    const isDelivery = item.assignments?.some(a => a.status === 'ACTIVE' && a.type === 'DELIVERY');
    const deliveryStyle = isDelivery ? { borderColor: '#f59e0b', borderWidth: 1, backgroundColor: '#fffbeb' } : {};

    return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ENTRY_DETAIL_SCREEN', { id: item.id })}
    >
      <Surface style={[styles.card, getEntryWarningStyle(item), deliveryStyle]} elevation={1}>
          <View style={styles.cardHeader}>
              <View style={styles.plateContainer}>
                  <Icon source="ticket-confirmation" size={18} color="#1e3a8a" />
                  <Text variant="titleMedium" style={[styles.plate, { marginLeft: 8 }]}>{item.entryNumber}</Text>
              </View>
              <View style={{flexDirection: 'row', gap: 4}}>
                {isDelivery && (
                    <View style={[styles.statusBadge, { backgroundColor: '#fef3c7' }]}>
                        <Text style={[styles.statusText, { color: '#d97706' }]}>En Entrega</Text>
                    </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>
          </View>
          
          <View style={styles.cardContent}>
              <View style={styles.infoRow}>
                  <Icon source="car-side" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{item.brand} {item.model}</Text>
              </View>
              {item.plates ? (
                  <View style={styles.infoRow}>
                      <Icon source="card-text-outline" size={20} color="#64748b" />
                      <Text style={styles.infoText}>{item.plates}</Text>
                  </View>
              ) : null}
              <View style={styles.infoRow}>
                  <Icon source="palette" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{item.color}</Text>
              </View>
              <View style={styles.infoRow}>
                  <Icon source="clock-outline" size={20} color="#64748b" />
                  <Text style={styles.infoText}>{dayjs(item.entryDate).format('D MMM, HH:mm')}</Text>
              </View>
          </View>

          {item.locationId && (
              <View style={styles.locationFooter}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon source="map-marker" size={16} color="#3b82f6" />
                    <Text style={styles.locationText}>Zona {item.location?.name || item.locationId}</Text>
                  </View>
                  
                  {item.assignments?.find(a => a.status === 'ACTIVE' && a.type === 'MOVEMENT') ? (
                     <Button 
                        mode="contained-tonal" 
                        compact 
                        labelStyle={{ fontSize: 12 }} 
                        icon="check-circle"
                        buttonColor="#dcfce7"
                        textColor="#166534"
                        onPress={() => handleFinishAssignment(item.assignments!.find(a => a.status === 'ACTIVE')!)}
                      >
                          Terminar Movimiento
                      </Button>
                  ) : isDelivery ? (
                       <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
                           <Icon source="run-fast" size={18} color="#d97706" />
                           <Text style={{ marginLeft: 6, color: '#d97706', fontWeight: 'bold', fontSize: 12 }}>Valet Buscando...</Text>
                       </View>
                  ) : (
                       role !== 'USER' && (
                        <Button 
                            mode="text" 
                            compact 
                            labelStyle={{ fontSize: 12 }} 
                            onPress={() => setActionEntry(item)}
                            disabled={item.status !== 'ACTIVE' && item.status !== 'MOVED'}
                        >
                            Acciones
                        </Button>
                      )
                  )}
              </View>
          )}

          {!item.locationId && (
               <View style={styles.locationFooter}>
                  <View style={{ flex: 1 }} />
                  {item.assignments?.find(a => a.status === 'ACTIVE' && a.type === 'MOVEMENT') ? (
                     <Button 
                        mode="contained-tonal" 
                        compact 
                        labelStyle={{ fontSize: 12 }} 
                        icon="check-circle"
                        buttonColor="#dcfce7"
                        textColor="#166534"
                        onPress={() => handleFinishAssignment(item.assignments!.find(a => a.status === 'ACTIVE')!)}
                      >
                          Terminar Movimiento
                      </Button>
                  ) : isDelivery ? (
                       <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.8 }}>
                           <Icon source="run-fast" size={18} color="#d97706" />
                           <Text style={{ marginLeft: 6, color: '#d97706', fontWeight: 'bold', fontSize: 12 }}>Valet Buscando...</Text>
                       </View>
                   ) : (
                      role == 'USER' && (
                        <Button 
                            mode="text" 
                            compact 
                            labelStyle={{ fontSize: 12 }} 
                            onPress={() => setActionEntry(item)}
                            disabled={item.status !== 'ACTIVE' && item.status !== 'MOVED'}
                        >
                            Acciones
                        </Button>
                      )
                  )}
              </View>
          )}
      </Surface>
    </TouchableOpacity>
  );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
          <Searchbar
              placeholder="Buscar Ticket o Placa"
              onChangeText={onChangeSearch}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              elevation={0}
          />
      </View>

      {loading && !refreshing ? (
        <LoaderComponent />
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Icon source="car-off" size={64} color="#cbd5e1" />
                <Text style={styles.emptyText}>No hay entradas registradas</Text>
                <Text style={styles.emptySubtext}>Las nuevas entradas aparecerán aquí</Text>
            </View>
          }
        />
      )}

      {role !== 'USER' && (
        <FAB
            icon="plus"
            style={[styles.fab, { bottom: insets.bottom + 20 }]}
            color="white"
            onPress={() => navigation.navigate('CREATE_ENTRY_SCREEN')}
        />
      )}

      <ActionModal 
        visible={!!actionEntry} 
        entry={actionEntry} 
        onDismiss={() => setActionEntry(null)} 
        onSuccess={() => {
            loadEntries();
            // Maybe show toast
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
      padding: 20,
      paddingBottom: 10,
      backgroundColor: '#fff',
  },
  headerTitle: {
      fontWeight: 'bold',
      color: '#0f172a',
  },
  headerSubtitle: {
      color: '#64748b',
  },
  searchBar: {
      marginTop: 16,
      backgroundColor: '#f1f5f9',
      borderRadius: 12,
      height: 48,
  },
  searchInput: {
      minHeight: 0,
  },
  list: {
    padding: 16,
    paddingBottom: 100, // Increased padding for list to avoid FAB
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  plateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#eff6ff',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#dbeafe',
  },
  plate: {
      fontWeight: 'bold',
      color: '#1e3a8a',
      letterSpacing: 0.5,
  },
  statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
  },
  statusText: {
      fontSize: 11,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  cardContent: {
      marginBottom: 12,
  },
  infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
  },
  infoText: {
      marginLeft: 8,
      color: '#475569',
      fontSize: 14,
  },
  locationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between', 
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#f1f5f9',
  },
  locationText: {
      marginLeft: 6,
      color: '#3b82f6',
      fontWeight: '600',
      fontSize: 13,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#94a3b8',
  },
  emptySubtext: {
      marginTop: 8,
      color: '#cbd5e1',
  }
});
