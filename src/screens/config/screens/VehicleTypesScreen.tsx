import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, FAB, IconButton, List, Portal, Text, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showToast } from '../../../core/store/slices/toast.slice';
import { useDispatch } from 'react-redux';
import { VehicleType, createVehicleType, deleteVehicleType, getVehicleTypes, updateVehicleType } from '../services/VehicleTypesService';
import ModernStyles from '../../../shared/theme/app.styles';

export const VehicleTypesScreen = () => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Dialog State
    const [visible, setVisible] = useState(false);
    const [editingType, setEditingType] = useState<VehicleType | null>(null);
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');

    const fetchTypes = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getVehicleTypes();
            if (res.success && res.data) {
                setTypes(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    const showDialog = (type?: VehicleType) => {
        setEditingType(type || null);
        setName(type?.name || '');
        setCost(type?.cost?.toString() || '');
        setVisible(true);
    };

    const hideDialog = () => {
        setVisible(false);
        setEditingType(null);
        setName('');
        setCost('');
    };

    const handleSave = async () => {
        if (!name || !cost) {
            dispatch(showToast({ message: 'Nombre y Costo requeridos', type: 'error' }));
            return;
        }

        try {
            setLoading(true);
            let res;
            if (editingType) {
                res = await updateVehicleType(editingType.id, { name, cost: Number(cost) });
            } else {
                res = await createVehicleType({ name, cost: Number(cost) });
            }

            if (res.success) {
                dispatch(showToast({ message: 'Guardado correctamente', type: 'success' }));
                hideDialog();
                fetchTypes();
            } else {
                dispatch(showToast({ message: res.messages?.[0] || 'Error al guardar', type: 'error' }));
            }
        } catch (error: any) {
            dispatch(showToast({ message: error.message, type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            const res = await deleteVehicleType(id);
            if (res.success) {
                dispatch(showToast({ message: 'Eliminado correctamente', type: 'success' }));
                fetchTypes();
            }
        } catch (error: any) {
            dispatch(showToast({ message: error.message, type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[ModernStyles.screenContainer, { paddingBottom: insets.bottom }]}>
            <FlatList
                data={types}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        description={`Costo por día: $${item.cost}`}
                        left={props => <List.Icon {...props} icon="car" />}
                        right={props => (
                            <View style={{ flexDirection: 'row' }}>
                                <IconButton icon="pencil" onPress={() => showDialog(item)} />
                                <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
                            </View>
                        )}
                        style={styles.card}
                    />
                )}
            />

            <FAB
                icon="plus"
                style={[styles.fab, { bottom: insets.bottom + 16 }]}
                onPress={() => showDialog()}
                label="Nuevo Tipo"
            />

            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>{editingType ? 'Editar Tipo' : 'Nuevo Tipo'}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Nombre (Ej: SUV)"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            mode="outlined"
                        />
                        <TextInput
                            label="Costo Diario ($)"
                            value={cost}
                            onChangeText={setCost}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>Cancelar</Button>
                        <Button onPress={handleSave} loading={loading} disabled={loading}>Guardar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        marginBottom: 8,
        borderRadius: 8,
        elevation: 1,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
    },
    input: {
        marginBottom: 12,
    }
});
