import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Image } from 'react-native';
import { Button, Checkbox, Dialog, Divider, Portal, Text, Icon } from 'react-native-paper';
import { VehicleEntry } from '../../../core/types/VehicleEntry';
import dayjs from 'dayjs';
import { getFullImageUrl } from '../../../core/utils/imageUtils';

interface Props {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: () => void;
    entry: VehicleEntry;
    dayCost: number;
    loading?: boolean;
}

export const FinishDeliveryModal = ({ visible, onDismiss, onConfirm, entry, dayCost, loading }: Props) => {
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

    const extraPhotos = useMemo(() => {
        return entry.photos?.filter(p => p.category === 'extra') || [];
    }, [entry]);

    // Reset checks when opening
    useEffect(() => {
        if (visible) {
            setCheckedItems({});
        }
    }, [visible, extraPhotos]);

    const handleCheck = (id: number) => {
        setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const allChecked = useMemo(() => {
        if (extraPhotos.length === 0) return true;
        return extraPhotos.every(p => checkedItems[p.id]);
    }, [extraPhotos, checkedItems]);

    // Costs Calculation
    const calculations = useMemo(() => {
        const now = dayjs();
        const start = dayjs(entry.entryDate);
        const durationHours = now.diff(start, 'hour', true);
        const days = Math.max(1, Math.ceil(durationHours / 24));
        
        const stayCost = days * dayCost;
        const extrasSum = entry.extraCosts?.reduce((sum, c) => sum + c.amount, 0) || 0;
        
        return {
            days,
            stayCost,
            extrasSum,
            total: stayCost + extrasSum
        };
    }, [entry, dayCost]);

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: 'white' }}>
                <Dialog.Title>Confirmar Entrega</Dialog.Title>
                <Dialog.ScrollArea>
                    <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Resumen de Pago</Text>
                        
                        <View style={styles.row}>
                            <Text>Días de Estancia ({calculations.days})</Text>
                            <Text style={styles.amount}>${calculations.stayCost.toFixed(2)}</Text>
                        </View>
                        
                        {calculations.extrasSum > 0 && (
                            <View style={styles.row}>
                                <Text>Costos Extras ({entry.extraCosts?.length || 0})</Text>
                                <Text style={styles.amount}>${calculations.extrasSum.toFixed(2)}</Text>
                            </View>
                        )}
                        
                        <Divider style={styles.divider} />
                        
                        <View style={styles.rowTotal}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Total a Pagar</Text>
                            <Text variant="headlineSmall" style={styles.totalAmount}>${calculations.total.toFixed(2)}</Text>
                        </View>

                        {/* Belongings Verification */}
                        {extraPhotos.length > 0 && (
                            <>
                                <View style={styles.warningBox}>
                                    <Icon source="alert-circle" size={20} color="#ea580c" />
                                    <Text style={styles.warningText}>
                                        Por favor verifica que se entreguen las siguientes pertenencias registradas:
                                    </Text>
                                </View>

                                {extraPhotos.map(photo => (
                                    <View key={photo.id} style={styles.checkRow}>
                                        <Checkbox
                                            status={checkedItems[photo.id] ? 'checked' : 'unchecked'}
                                            onPress={() => handleCheck(photo.id)}
                                            color="#166534"
                                        />
                                        {photo.imageUrl && (
                                            <Image 
                                                source={{ uri: getFullImageUrl(photo.imageUrl) || undefined }} 
                                                style={styles.checkImage} 
                                            />
                                        )}
                                        <View style={{flex: 1, marginLeft: 8}}>
                                            <Text style={styles.checkLabel}>
                                                {photo.description || 'Sin descripción'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                    </ScrollView>
                </Dialog.ScrollArea>
                <Dialog.Actions>
                    <Button onPress={onDismiss} textColor="#64748b">Cancelar</Button>
                    <Button 
                        onPress={onConfirm} 
                        mode="contained" 
                        loading={loading}
                        disabled={loading || !allChecked}
                        style={{ marginLeft: 8 }}
                    >
                        Confirmar y Finalizar
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#334155'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    amount: {
        fontWeight: '500',
        color: '#0f172a'
    },
    divider: {
        marginVertical: 12,
        backgroundColor: '#cbd5e1'
    },
    rowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    totalAmount: {
        fontWeight: 'bold',
        color: '#166534'
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: '#fff7ed',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        gap: 8
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#c2410c'
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 8
    },
    checkImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginLeft: 8
    },
    checkLabel: {
        fontWeight: '500',
        color: '#334155'
    }
});
