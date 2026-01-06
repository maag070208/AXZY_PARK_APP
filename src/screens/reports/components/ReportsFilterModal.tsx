import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Modal, Portal, Surface, Text } from 'react-native-paper';

interface ReportsFilterModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (filters: { startDate: string; endDate: string }) => void;
    reportType: string | null;
}

const REPORT_DESCRIPTIONS: Record<string, string> = {
    'FINANCIAL': 'Resumen detallado de ingresos por estacionamiento y servicios adicionales, incluyendo desglose de transacciones y totales.',
    'OPERATORS': 'Auditoría de rendimiento por operador: conteo de vehículos recibidos, salidas procesadas y dinero recaudado por cada miembro del personal.',
    'OCCUPANCY': 'Análisis de flujo de vehículos: total de entradas y salidas en el periodo seleccionado para medir la ocupación.',
    // Add others if needed
};

export const ReportsFilterModal = ({ visible, onDismiss, onSubmit, reportType }: ReportsFilterModalProps) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const description = reportType ? REPORT_DESCRIPTIONS[reportType] : 'Seleccione un rango de fechas para generar el reporte.';

    const handleSubmit = () => {
        onSubmit({
            startDate: dayjs(startDate).format('YYYY-MM-DD'),
            endDate: dayjs(endDate).format('YYYY-MM-DD'),
        });
        onDismiss();
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
                <>
                    <Surface style={styles.content}>
                        <Text variant="headlineSmall" style={styles.title}>Filtrar Reportes</Text>
                        
                        {reportType && (
                            <View style={styles.descriptionContainer}>
                                <Text style={styles.descriptionText}>{description}</Text>
                            </View>
                        )}
                        
                        <Text style={styles.label}>Rango de Fechas</Text>
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

                        <View style={styles.actions}>
                            <Button onPress={onDismiss} style={styles.button}>Cancelar</Button>
                            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                                Aplicar
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
    descriptionContainer: {
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6'
    },
    descriptionText: {
        color: '#1E3A8A',
        fontSize: 14,
        lineHeight: 20
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
