import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Searchbar, Text, Button, Card, Avatar, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { getUsers, User } from '../../../users/services/UserService';
import { getUserVehicles } from '../../services/EntriesService';
import { NewUserForm } from './NewUserForm';
import { getFullImageUrl } from '../../../../core/utils/imageUtils';

interface Props {
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
  users: any[];
  setUsers: (users: any[]) => void;
  onVehicleSelected: (vehicle: any) => void;
}

export const UserSelectionStep = ({ selectedUserId, setSelectedUserId, users, setUsers, onVehicleSelected }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [displayedUser, setDisplayedUser] = useState<any>(null);

  // Sync displayedUser if returning to step or initial load
  useEffect(() => {
     if (selectedUserId && users.length > 0 && !displayedUser) {
         const found = users.find(u => u.id === selectedUserId);
         if (found) setDisplayedUser(found);
     }
  }, [selectedUserId, users]);

  // Debounce search
  useEffect(() => {
    if (selectedUserId) return; // Don't search if user is selected
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedUserId]);

  const fetchUsers = async (query: string = '') => {
    setLoading(true);
    try {
      const res = await getUsers(query);
      if (res && res.data) {
        setUsers(res.data.filter((u: any) => u.role === 'USER'));
      }
    } catch (error) {
      console.log('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (user: any) => {
    setDisplayedUser(user);
    setSelectedUserId(user.id);
    setSearchQuery(''); 
    setLoadingVehicles(true);
    try {
        const res = await getUserVehicles(user.id);
        if (res && res.data) {
            setUserVehicles(res.data);
        } else {
            setUserVehicles([]);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoadingVehicles(false);
    }
  };

  const renderVehicleItem = ({ item }: { item: any }) => {
      const mainPhoto = item.photos?.find((p: any) => p.category === 'frontal')?.imageUrl;
      return (
        <TouchableOpacity onPress={() => onVehicleSelected(item)} activeOpacity={0.8}>
            <View style={styles.vehicleCard}>
                {mainPhoto ? (
                     <Image source={{ uri: getFullImageUrl(mainPhoto) || undefined }} style={styles.vehicleImage} />
                ) : (
                     <View style={styles.vehiclePlaceholder}>
                         <IconButton icon="car" size={32} iconColor="#cbd5e1" />
                     </View>
                )}
                
                <View style={styles.vehicleContent}>
                    <Text variant="titleMedium" style={styles.plateText}>{item.entryNumber || 'Sin Ticket'}</Text>
                    <Text variant="bodySmall" style={styles.vehicleSubtext} numberOfLines={1}>
                        {item.brand} {item.model}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                        <View style={styles.vehicleBadge}>
                            <Text style={styles.vehicleBadgeText}>{item.color}</Text>
                        </View>
                        {item.plates ? (
                             <View style={[styles.vehicleBadge, { backgroundColor: '#e2e8f0' }]}>
                                <Text style={styles.vehicleBadgeText}>{item.plates}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
      );
  };

  if (isCreatingUser) {
    return (
        <View style={styles.container}>
            <NewUserForm 
                onCancel={() => setIsCreatingUser(false)} 
                onSuccess={(user) => {
                    handleUserSelect(user);
                    setIsCreatingUser(false);
                }} 
            />
        </View>
    );
  }

  return (
    <View style={styles.container}>
     

      {!selectedUserId && (
        <Searchbar
            placeholder="Buscar..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            elevation={0}
        />
      )}

      {!selectedUserId ? (
          <View style={styles.listContainer}>
              {loading ? (
                  <ActivityIndicator style={{ marginTop: 20 }} />
              ) : (
                  <FlatList
                    data={users}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleUserSelect(item)} style={styles.userItem}>
                            <Avatar.Text 
                                size={44} 
                                label={item.name.substring(0, 2).toUpperCase()} 
                                style={{ backgroundColor: '#f1f5f9' }} 
                                color="#475569" 
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text variant="titleMedium" style={{ fontWeight: '600' }}>{item.name} {item.lastName}</Text>
                                <Text variant="bodySmall" style={{ color: '#64748b' }}>{item.email}</Text>
                            </View>
                            <IconButton icon="chevron-right" size={20} iconColor="#cbd5e1" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: '#94a3b8' }}>No se encontraron usuarios</Text>}
                  />
              )}
               <Button mode="contained-tonal" icon="account-plus" onPress={() => setIsCreatingUser(true)} style={styles.createButton}>
                  Registrar Nuevo Cliente
              </Button>
          </View>
      ) : (
          <View style={styles.selectedContainer}>
               <Card style={styles.selectedUserCard}>
                   <Card.Title 
                        title={`${displayedUser?.name || 'Cargando...'} ${displayedUser?.lastName || ''}`}
                        subtitle={displayedUser?.email || 'Cliente'}
                        left={(props) => <Avatar.Icon {...props} icon="account-check" style={{ backgroundColor: '#22c55e' }} />}
                        right={(props) => <IconButton {...props} icon="close" onPress={() => { setSelectedUserId(null); setDisplayedUser(null); setUserVehicles([]); setSearchQuery(''); }} />}
                   />
               </Card>

               {/* Previous Vehicles Removed as per request
               <Text variant="titleMedium" style={styles.sectionTitle}>Vehículos Anteriores</Text>
               {loadingVehicles ? (
                   <ActivityIndicator style={{ margin: 20 }} />
               ) : userVehicles.length > 0 ? (
                   <View>
                       <Text variant="bodySmall" style={{ marginBottom: 10, color: '#64748b' }}>Toque para autocompletar datos</Text>
                       <FlatList 
                            data={userVehicles}
                            renderItem={renderVehicleItem}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 10 }}
                       />
                   </View>
               ) : (
                   <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Este cliente no tiene vehículos registrados.</Text>
               )}
               */}
          </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  headerContainer: {
      marginBottom: 24,
      marginTop: 10,
  },
  title: {
      fontWeight: '700',
      color: '#0f172a',
      fontSize: 24,
      letterSpacing: -0.5,
  },
  subtitle: {
      color: '#64748b',
      fontSize: 14,
      marginTop: 4,
  },
  searchBar: {
      backgroundColor: '#f8fafc',
      borderRadius: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 5,
      elevation: 1,
      height: 52,
  },
  searchInput: {
      minHeight: 0,
      fontSize: 15,
      color: '#334155',
  },
  listContainer: {
      flex: 1,
  },
  userItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      marginBottom: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#f1f5f9',
      // Subtle shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 2,
  },
  createButton: {
      marginTop: 16,
      borderColor: '#e2e8f0',
      borderRadius: 12,
  },
  selectedContainer: {
      flex: 1,
  },
  selectedUserCard: {
      marginBottom: 24,
      backgroundColor: '#f0f9ff', 
      borderColor: '#bae6fd',
      borderWidth: 1,
      elevation: 0,
      borderRadius: 8,
  },
  sectionTitle: {
      fontWeight: '700',
      marginBottom: 16, 
      color: '#334155',
      fontSize: 18,
  },
  vehicleCard: {
      width: 160,
      marginRight: 16,
      backgroundColor: '#fff',
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 4,
      overflow: 'hidden', // Essential for image radius
      borderWidth: 1,
      borderColor: '#f1f5f9',
  },
  vehicleImage: {
      width: '100%',
      height: 110,
      resizeMode: 'cover',
  },
  vehiclePlaceholder: {
      width: '100%',
      height: 110,
      backgroundColor: '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
  },
  vehicleContent: {
      padding: 12,
  },
  plateText: {
      fontWeight: '800',
      color: '#0f172a',
      fontSize: 18,
      marginBottom: 2,
  },
  vehicleSubtext: {
      color: '#64748b',
      fontSize: 13,
      marginBottom: 8,
  },
  vehicleBadge: {
      backgroundColor: '#f1f5f9',
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
  },
  vehicleBadgeText: {
      fontSize: 11,
      color: '#475569',
      fontWeight: '600',
      textTransform: 'capitalize',
  }
});
