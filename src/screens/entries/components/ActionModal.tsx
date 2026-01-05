import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Divider, IconButton, Menu, Modal, Portal, Text } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../../core/store/hooks';
import { getUsers } from '../../users/services/UserService';
import { getLocations } from '../../locations/service/location.service';
import { showToast } from '../../../core/store/slices/toast.slice';
import { assignKey } from '../services/EntriesService';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  entry: any; // VehicleEntry
  onSuccess: () => void;
}

export const ActionModal = ({ visible, onDismiss, entry, onSuccess }: Props) => {
  const currentUser = useAppSelector(state => state.userState);
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<'SELECT_ACTION' | 'CONFIGURE'>('SELECT_ACTION');
  const [actionType, setActionType] = useState<'MOVEMENT' | 'DELIVERY' | null>(null);
  
  // Data
  const [operators, setOperators] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Form
  const [selectedOperatorId, setSelectedOperatorId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Menus
  const [showOperatorMenu, setShowOperatorMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);

  useEffect(() => {
    if (visible && entry) {
        resetState();
        fetchData();
    }
  }, [visible, entry]);

  const resetState = () => {
      setStep('SELECT_ACTION');
      setActionType(null);
      setSelectedOperatorId(Number(currentUser?.id) || null);
      setSelectedLocationId(null);
      setSubmitting(false);
  };

  const fetchData = async () => {
      setLoadingData(true);
      try {
          const [usersRes, locsRes] = await Promise.all([
              getUsers(), 
              getLocations() as Promise<any>
          ]);
          
          if (usersRes && usersRes.data) {
              setOperators(usersRes.data.filter((u: any) => u.role === 'OPERATOR'));
          }

          if (locsRes && locsRes.data) {
              setLocations(locsRes.data);
          }
      } catch (error) {
          console.error(error);
      } finally {
          setLoadingData(false);
      }
  };

  const handleActionSelect = (type: 'MOVEMENT' | 'DELIVERY') => {
      setActionType(type);
      setStep('CONFIGURE');
  };

  const handleSubmit = async () => {
      if (!entry || !selectedOperatorId) return;
      if (actionType === 'MOVEMENT' && !selectedLocationId) return;

      setSubmitting(true);
      try {
        if (!actionType) {
            dispatch(showToast({ message: 'Debe seleccionar una acción', type: 'error' }));
            return;
        }

        if (actionType === 'MOVEMENT' && !selectedLocationId) {
            dispatch(showToast({ message: 'Debe seleccionar una ubicación', type: 'error' }));
            return;
        }

          await assignKey(entry.id, selectedOperatorId, actionType, selectedLocationId || undefined);
          onSuccess();
          onDismiss();
      } catch (error) {
          console.error(error);
          dispatch(showToast({ message: 'Error al asignar acción', type: 'error' }));
      } finally {
          setSubmitting(false);
      }
  };

  const getOperatorName = () => {
      const op = operators.find(o => o.id === selectedOperatorId);
      return op ? `${op.name} ${op.lastName}` : 'Seleccionar Operador';
  };

  const getLocationName = () => {
    const loc = locations.find(l => l.id === selectedLocationId);
    return loc ? `${loc.name}` : 'Seleccionar Ubicación';
  };

  return (
    <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                    {step === 'SELECT_ACTION' ? 'Seleccionar Acción' : actionType === 'MOVEMENT' ? 'Mover Vehículo' : 'Entregar Vehículo'}
                </Text>
                <IconButton icon="close" onPress={onDismiss} />
            </View>
            
            <View style={styles.content}>
                {loadingData ? (
                    <ActivityIndicator style={{ padding: 20 }} />
                ) : step === 'SELECT_ACTION' ? (
                    <View style={styles.actionsGrid}>
                        <Card style={styles.actionCard} onPress={() => handleActionSelect('MOVEMENT')}>
                            <Card.Content style={styles.actionContent}>
                                <Avatar.Icon icon="car-shift-pattern" size={50} style={{ backgroundColor: '#e0f2fe' }} color="#0284c7" />
                                <Text style={styles.actionTitle}>Mover</Text>
                                <Text style={styles.actionDesc}>Cambiar de cajón</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.actionCard} onPress={() => handleActionSelect('DELIVERY')}>
                            <Card.Content style={styles.actionContent}>
                                <Avatar.Icon icon="key-variant" size={50} style={{ backgroundColor: '#dcfce7' }} color="#16a34a" />
                                <Text style={styles.actionTitle}>Entregar</Text>
                                <Text style={styles.actionDesc}>Devolver al cliente</Text>
                            </Card.Content>
                        </Card>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.label}>Vehículo</Text>
                        <Card style={styles.infoCard}>
                            <Card.Title 
                                title={`${entry?.brand} ${entry?.model}`}
                                subtitle={entry?.plates}
                                left={(props) => <Avatar.Icon {...props} icon="car" size={40} />}
                            />
                        </Card>

                        <Divider style={styles.divider} />

                        {actionType === 'MOVEMENT' && (
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nueva Ubicación</Text>
                                <Menu
                                    visible={showLocationMenu}
                                    onDismiss={() => setShowLocationMenu(false)}
                                    anchor={
                                        <Button mode="outlined" onPress={() => setShowLocationMenu(true)} contentStyle={{ justifyContent: 'flex-start' }} style={styles.dropdownBtn}>
                                            {getLocationName()}
                                        </Button>
                                    }
                                >
                                    <ScrollView style={{ maxHeight: 200 }}>
                                    {locations.map(l => (
                                        <Menu.Item key={l.id} onPress={() => { setSelectedLocationId(l.id); setShowLocationMenu(false); }} title={l.name} />
                                    ))}
                                    </ScrollView>
                                </Menu>
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Operador Responsable</Text>
                            <Menu
                                visible={showOperatorMenu}
                                onDismiss={() => setShowOperatorMenu(false)}
                                anchor={
                                    <Button mode="outlined" onPress={() => setShowOperatorMenu(true)} contentStyle={{ justifyContent: 'flex-start' }} style={styles.dropdownBtn}>
                                        {getOperatorName()}
                                    </Button>
                                }
                            >
                                <ScrollView style={{ maxHeight: 200 }}>
                                {operators.map(o => (
                                    <Menu.Item key={o.id} onPress={() => { setSelectedOperatorId(o.id); setShowOperatorMenu(false); }} title={`${o.name} ${o.lastName}`} />
                                ))}
                                </ScrollView>
                            </Menu>
                        </View>

                        <Button 
                            mode="contained" 
                            onPress={handleSubmit} 
                            loading={submitting} 
                            disabled={submitting || (actionType === 'MOVEMENT' && !selectedLocationId) || !selectedOperatorId}
                            style={styles.submitBtn}
                        >
                            Confirmar
                        </Button>
                        <Button mode="text" onPress={() => setStep('SELECT_ACTION')} disabled={submitting}>
                            Volver
                        </Button>
                    </View>
                )}
            </View>
        </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
      backgroundColor: 'white',
      margin: 20,
      borderRadius: 16,
      overflow: 'hidden',
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
  },
  content: {
      padding: 20,
  },
  actionsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
  },
  actionCard: {
      flex: 1,
      backgroundColor: '#fff',
      elevation: 2,
  },
  actionContent: {
      alignItems: 'center',
      paddingVertical: 20,
  },
  actionTitle: {
      marginTop: 12,
      fontWeight: 'bold',
      fontSize: 16,
      color: '#0f172a',
  },
  actionDesc: {
      fontSize: 12,
      color: '#64748b',
      textAlign: 'center',
  },
  label: {
      fontWeight: '600',
      marginBottom: 8,
      color: '#475569',
  },
  infoCard: {
      backgroundColor: '#f8fafc',
      marginBottom: 16,
  },
  divider: {
      marginBottom: 16,
  },
  formGroup: {
      marginBottom: 16,
  },
  dropdownBtn: {
      borderRadius: 8,
      borderColor: '#cbd5e1',
  },
  submitBtn: {
      marginTop: 8,
      marginBottom: 8,
  }
});
