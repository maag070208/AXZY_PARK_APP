import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Modal, Portal, Surface, Text } from 'react-native-paper';
import { UserSearchInput } from '../../users/components/UserSearchInput';
import { User } from '../../users/services/UserService';

interface KardexFilterModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (filters: { startDate: string; endDate: string; operatorId?: string; userId?: string }) => void;
}

export const KardexFilterModal = ({ visible, onDismiss, onSubmit }: KardexFilterModalProps) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [operator, setOperator] = useState<User | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleSubmit = () => {
        onSubmit({
            startDate: dayjs(startDate).format('YYYY-MM-DD'),
            endDate: dayjs(endDate).format('YYYY-MM-DD'),
            operatorId: operator?.id ? String(operator.id) : undefined,
            userId: user?.id ? String(user.id) : undefined
        });
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <>
                    <Surface style={styles.content}>
                        <Text variant="headlineSmall" style={styles.title}>Generar Reporte PDF</Text>
                        
                        {/* Date Range */}
                        <Text style={styles.label}>Rango de Fechas (Obligatorio)</Text>
                        <View style={styles.dateRow}>
                            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
                                <Text style={styles.dateText}>Desde: {dayjs(startDate).format('DD/MM/YYYY')}</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateButton}>
                                <Text style={styles.dateText}>Hasta: {dayjs(endDate).format('DD/MM/YYYY')}</Text>
                            </TouchableOpacity>
                        </View>

                        {(showStartPicker || showEndPicker) && (
                            <DateTimePicker
                                value={showStartPicker ? startDate : endDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    const currentDate = selectedDate || (showStartPicker ? startDate : endDate);
                                    if (showStartPicker) {
                                        setShowStartPicker(false);
                                        setStartDate(currentDate);
                                    } else {
                                        setShowEndPicker(false);
                                        setEndDate(currentDate);
                                    }
                                }}
                            />
                        )}

                        {/* Operator (Optional) */}
                        <UserSearchInput 
                            label="Operador (Opcional)"
                            value={operator}
                            onSelect={setOperator}
                            role="OPERATOR"
                        />

                        {/* User (Optional) */}
                        <UserSearchInput 
                            label="Cliente (Opcional)"
                            value={user}
                            onSelect={setUser}
                            role="USER"
                        />

                        <View style={styles.actions}>
                            <Button onPress={onDismiss} style={styles.button}>Cancelar</Button>
                            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                                Generar PDF
                            </Button>
                        </View>
                    </Surface>
                </>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    content: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 16,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#1e293b',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#475569',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 10,
    },
    dateButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    dateText: {
        color: '#334155',
        fontWeight: '500',
    },
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 10,
    },
    button: {
        borderRadius: 8,
    }
});
