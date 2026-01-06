import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, Card, Text, TextInput, List } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSystemConfig, updateSystemConfig } from '../services/ConfigService';
import ModernStyles from '../../../shared/theme/app.styles';

export const ConfigScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Config States
    const [maxCapacity, setMaxCapacity] = useState('');
    const [dayCost, setDayCost] = useState('');

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await getSystemConfig();
            if (res.success && res.data) {
                setMaxCapacity(String(res.data.maxCapacity));
                setDayCost(String(res.data.dayCost || 60));
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo cargar la configuración.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await updateSystemConfig(Number(maxCapacity), Number(dayCost));
            if (res.success) {
                Alert.alert("Éxito", "Configuración actualizada correctamente.");
            } else {
                Alert.alert("Error", res.messages?.[0] || "Error al actualizar");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error de conexión.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[ModernStyles.screenContainer, { paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>Configuración del Sistema</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <List.Item
                            title="Tipos de Vehículos"
                            description="Gestionar catálogo de vehículos y costos"
                            left={props => <List.Icon {...props} icon="car-cog" />}
                            right={props => <List.Icon {...props} icon="chevron-right" />}
                            onPress={() => navigation.navigate('VEHICLE_TYPES_SCREEN')}
                            style={{ marginBottom: 16, backgroundColor: '#f8fafc', borderRadius: 8 }}
                        />

                        <Text variant="titleMedium" style={styles.sectionTitle}>Capacidad</Text>
                        <TextInput
                            label="Capacidad Máxima de Vehículos"
                            value={maxCapacity}
                            onChangeText={setMaxCapacity}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            disabled={loading || saving}
                        />
                        <Text style={styles.helperText}>Define el número total de espacios disponibles en el estacionamiento.</Text>

                        <View style={styles.divider} />

                        <Text variant="titleMedium" style={styles.sectionTitle}>Tarifas</Text>
                        <TextInput
                            label="Costo por Día (MXN)"
                            value={dayCost}
                            onChangeText={setDayCost}
                            keyboardType="numeric"
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Affix text="$" />}
                            disabled={loading || saving}
                        />
                        <Text style={styles.helperText}>Costo que se cobrará por cada día (o fracción) de estancia.</Text>
                    </Card.Content>
                    <Card.Actions style={{padding: 16}}>
                         <Button 
                            mode="contained" 
                            onPress={handleSave} 
                            loading={saving} 
                            disabled={loading || saving}
                            style={{flex:1}}
                         >
                             Guardar Cambios
                         </Button>
                    </Card.Actions>
                </Card>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    content: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        elevation: 2,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
        color: '#1e293b'
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 8,
    },
    helperText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16,
    }
});
