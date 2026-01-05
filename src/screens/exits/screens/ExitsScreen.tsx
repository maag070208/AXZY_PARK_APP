import { useFocusEffect, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Icon, Searchbar, Text } from 'react-native-paper';
import { getExits, VehicleExit } from '../services/ExitsService';

export const ExitsScreen = () => {
    const navigation = useNavigation<any>();
    const [exits, setExits] = useState<VehicleExit[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchExits = async () => {
        try {
            const res = await getExits();
            if (res && res.data) {
                setExits(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExits();
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchExits();
    }, []);

    const filteredExits = useMemo(() => {
        if (!searchQuery) return exits;
        const query = searchQuery.toLowerCase();
        return exits.filter((exit) => 
            (exit.entry?.entryNumber && exit.entry.entryNumber.toLowerCase().includes(query)) ||
            (exit.entry?.plates && exit.entry.plates.toLowerCase().includes(query)) ||
            (exit.entry?.brand && exit.entry.brand.toLowerCase().includes(query)) ||
            (exit.entry?.model && exit.entry.model.toLowerCase().includes(query))
        );
    }, [exits, searchQuery]);

    const renderItem = ({ item }: { item: VehicleExit }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity 
                style={styles.contentContainer}
                activeOpacity={0.7} 
                onPress={() => navigation.navigate('EXIT_DETAIL_SCREEN', { id: item.entryId })}
            >
                <View style={styles.iconContainer}>
                    <Icon source="exit-to-app" size={24} color="#ef4444" />
                </View>
                
                <View style={styles.infoContainer}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.ticketText}>Ticket #{item.entry?.entryNumber || item.entryId}</Text>
                        <Text style={styles.timeText}>{dayjs(item.exitDate).format('HH:mm')}</Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.detailsText} numberOfLines={1}>
                            {item.entry?.plates} • {item.entry?.brand} {item.entry?.model}
                        </Text>
                         <Text style={styles.dateText}>{dayjs(item.exitDate).format('DD/MM')}</Text>
                    </View>

                    {item.notes ? (
                        <Text style={styles.notesText} numberOfLines={1}>{item.notes}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) return <ActivityIndicator style={styles.loader} size="large" />;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Buscar ticket, placa..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{minHeight: 0}}
                />
            </View>

            <FlatList
                data={filteredExits}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon source="car-off" size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>
                            {exits.length === 0 ? "No hay salidas registradas" : "No se encontraron resultados"}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: '#ffffff',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1e293b',
    },
    searchBar: {
        backgroundColor: '#f1f5f9',
        elevation: 0,
        height: 48,
        borderRadius: 12,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    itemContainer: {
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: '#ffffff',
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
        overflow: 'hidden',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    ticketText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    timeText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    detailsText: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
        marginRight: 8,
    },
    dateText: {
        fontSize: 11,
        color: '#cbd5e1',
    },
    notesText: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16
    },
    emptyText: {
        color: '#94a3b8',
        fontSize: 16
    }
});
