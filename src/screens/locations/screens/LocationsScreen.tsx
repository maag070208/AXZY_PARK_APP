import React, { useEffect, useState, useMemo } from 'react';
import { Alert, FlatList, StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  ActivityIndicator,
  // Card, // Removed unused import
  FAB,
  IconButton,
  Modal,
  Portal,
  Text,
  Searchbar,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from '../service/location.service';
import { ILocation, ILocationCreate } from '../type/location.types';
import { LocationFormModal } from '../components/LocationFormModal';
import { theme } from '../../../shared/theme/theme';

export const LocationsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ILocation | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  // View Cars Modal
  const [viewingLocation, setViewingLocation] = useState<ILocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    const res = await getLocations();
    if (res.success) {
      setLocations(res.data as any);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setModalVisible(true);
  };

  const handleEdit = (loc: ILocation) => {
    setEditingLocation(loc);
    setModalVisible(true);
  };

  const handleDelete = (loc: ILocation) => {
    Alert.alert(
      'Eliminar Ubicación',
      `¿Estás seguro de eliminar "${loc.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteLocation(loc.id);
            loadLocations();
          },
        },
      ],
    );
  };

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    let res;
    if (editingLocation) {
      res = await updateLocation(editingLocation.id, data);
    } else {
      res = await createLocation(data);
    }
    setSubmitting(false);

    if (res.success) {
      setModalVisible(false);
      loadLocations();
    } else {
      Alert.alert('Error', 'No se pudo guardar la ubicación');
    }
  };

  const renderItem = ({ item }: { item: ILocation }) => (
    <View style={styles.itemContainer}>
       <TouchableOpacity 
           style={styles.contentContainer} 
           onPress={() => {
               setViewingLocation(item);
               setSearchQuery(''); 
           }}
           activeOpacity={0.7}
       >
           <View style={styles.iconContainer}>
                <IconButton icon="map-marker-radius" size={24} iconColor="#4f46e5" style={{margin:0}} />
           </View>
           
           <View style={styles.info}>
                <View style={styles.row}>
                    <Text variant="titleMedium" style={styles.nameText}>{item.name}</Text>
                    {item.entries && item.entries.length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.entries.length} Autos</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.detailsText}>
                   {item.aisle}{item.spot ? ` • ${item.spot}` : ''}
                </Text>
           </View>
       </TouchableOpacity>

       <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={20}
            iconColor="#94a3b8"
            onPress={() => handleEdit(item)}
            style={{margin: 0}}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor="#ef4444"
            onPress={() => handleDelete(item)}
            style={{margin: 0}}
          />
       </View>
    </View>
  );

  const filteredEntries = useMemo(() => {
    if (!viewingLocation?.entries) return [];
    if (!searchQuery) return viewingLocation.entries;

    const query = searchQuery.toLowerCase();
    return viewingLocation.entries.filter((entry: any) => 
        (entry.entryNumber && entry.entryNumber.toLowerCase().includes(query)) ||
        (entry.plates && entry.plates.toLowerCase().includes(query)) ||
        (entry.brand && entry.brand.toLowerCase().includes(query)) ||
        (entry.model && entry.model.toLowerCase().includes(query))
    );
  }, [viewingLocation, searchQuery]);

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleLarge" style={styles.emptyStateTitle}>
                No hay ubicaciones
              </Text>
              <Text variant="bodyMedium" style={styles.emptyStateText}>
                Presiona el botón + para agregar una nueva ubicación
              </Text>
            </View>
          }
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        onPress={handleCreate}
        color="white"
        mode="flat"
        size="medium"
        animated={true}
      />

      <LocationFormModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialData={editingLocation}
        loading={submitting}
      />

      {/* View Cars Modal */}
      <Portal>
         <Modal
            visible={!!viewingLocation}
            onDismiss={() => setViewingLocation(null)}
            contentContainerStyle={styles.carsModal}
         >
             <View style={styles.modalHeader}>
                <Text variant="headlineSmall" style={styles.title}>
                    Autos en {viewingLocation?.name}
                </Text>
                <IconButton icon="close" onPress={() => setViewingLocation(null)} style={{margin:0}} />
             </View>
             
             <Searchbar
                placeholder="Buscar ticket, placa, modelo..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                inputStyle={{minHeight: 0}} // Fix for some paper versions
             />

             {filteredEntries.length > 0 ? (
                 <FlatList 
                    data={filteredEntries}
                    keyExtractor={(e: any) => String(e.id)}
                    contentContainerStyle={{paddingBottom: 20}}
                    renderItem={({item}: any) => (
                        <View style={styles.carItem}>
                            <View style={styles.carIcon}>
                                <IconButton icon="car" size={20} iconColor="#475569" />
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={styles.ticketText}>Ticket #{item.entryNumber}</Text>
                                <Text style={styles.carTitle}>{item.brand} {item.model}</Text>
                                <Text style={styles.plateText}>{item.plates}</Text>
                            </View>
                            {/* Optional: Add status badge */}
                        </View>
                    )}
                 />
             ) : (
                 <View style={styles.emptyModalState}>
                     <Text style={{color: '#666'}}>
                        {viewingLocation?.entries?.length === 0 
                            ? "No hay vehículos en esta zona." 
                            : "No se encontraron resultados."}
                     </Text>
                 </View>
             )}
         </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  carsModal: {
       backgroundColor: 'white',
       padding: 24, 
       margin: 20, 
       borderRadius: 16,
       maxHeight: '80%',
       flex: 1, 
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  searchBar: {
      marginBottom: 16,
      backgroundColor: '#f1f5f9',
      elevation: 0,
      height: 48,
  },
  carItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      padding: 12,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#f1f5f9',
  },
  carIcon: {
      marginRight: 12,
      backgroundColor: '#f1f5f9',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center'
  },
  ticketText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 2,
  },
  carTitle: {
      fontSize: 13,
      color: '#475569',
      marginBottom: 2,
  },
  plateText: {
      fontSize: 12,
      color: '#94a3b8',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 12,
    paddingRight: 8, // for actions
    // Modern minimal shadow
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contentContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingLeft: 12,
  },
  iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#eef2ff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
  },
  info: {
      flex: 1,
      justifyContent: 'center',
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 2,
  },
  nameText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#1e293b',
  },
  badge: {
     backgroundColor: '#f1f5f9',
     paddingHorizontal: 6,
     paddingVertical: 2,
     borderRadius: 8,
  },
  badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#64748b',
  },
  detailsText: {
      fontSize: 13,
      color: '#94a3b8',
  },
  actions: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyModalState: {
      padding: 40, 
      alignItems: 'center', 
      justifyContent: 'center'
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
});
