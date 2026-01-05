import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Searchbar } from 'react-native-paper';
import dayjs from 'dayjs';
import ModernStyles from '../../../shared/theme/app.styles';
import { getKeyAssignments, KeyAssignment } from '../../entries/services/EntriesService';
import { Text } from 'react-native-paper';

export const KeyAssignmentsScreen = () => {
    const insets = useSafeAreaInsets();
    const [assignments, setAssignments] = useState<KeyAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAssignments = useCallback(async () => {
        try {
            const res = await getKeyAssignments();
            if (res.success && res.data) {
                setAssignments(res.data);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAssignments();
    };

    const filteredAssignments = useMemo(() => {
        if (!searchQuery) return assignments;
        const query = searchQuery.toLowerCase();
        return assignments.filter((item) => 
            (item.entry?.entryNumber && item.entry.entryNumber.toLowerCase().includes(query)) ||
            (item.operator?.name && item.operator.name.toLowerCase().includes(query)) ||
            (item.operator?.lastName && item.operator.lastName.toLowerCase().includes(query)) ||
             (item.entry?.plates && item.entry.plates.toLowerCase().includes(query))
        );
    }, [assignments, searchQuery]);

    const getStatusConfig = (status: string) => {
        return status === 'COMPLETED'
            ? { color: '#166534', text: 'COMPLETADO', bg: '#dcfce7' } // Green
            : { color: '#1e40af', text: 'EN PROGRESO', bg: '#eff6ff' }; // Blue
    };

    const renderItem = ({ item }: { item: KeyAssignment }) => {
        const statusConfig = getStatusConfig(item.status);
        
        // Logic to determine Source and Destination
        let sourceLocationName = 'Recepción';
        let destinationLocationName = 'Salida';
        let targetAisle = '';

        if (item.status === 'ACTIVE') {
            // If active, source is current location
            if (item.entry?.location) {
                sourceLocationName = `${item.entry.location.name} `;
            }
            // Destination is target
            if (item.targetLocation) {
                 destinationLocationName = `${item.targetLocation.name} `;
            }
        } else {
            // If completed, we need history.
            // Current location of entry is the DESTINATION of this movement.
            if (item.entry?.location) {
                 destinationLocationName = `${item.entry.location.name}`;
            }
            
            // Try to find the movement record
            // We look for a movement where 'toLocationId' matches our targetLocationId
            // And ideally created around endedAt
            const relevantMovement = item.entry?.movements?.find((m: any) => 
                m.toLocationId === item.targetLocationId
            );

            if (relevantMovement && relevantMovement.fromLocation) {
                sourceLocationName = `${relevantMovement.fromLocation.name}`;
            } else {
                 // Fallback: If we can't find history, maybe it was Reception? or show '?'
                 // But wait, if we are at destination C. And we don't know where we came from.
                 // Displaying "C" as source is WRONG.
                 // Better to display "..." or try to guess.
                 // If we have no movement history, it might have been from Reception if it was the first move?
                 // But let's check if targetLocationId is set.
            }
        }

        return (
            <View style={styles.itemContainer}>
                <View style={styles.contentContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Icon source="key" size={24} color="#a855f7" />
                    </View>

                    {/* Info */}
                    <View style={styles.infoContainer}>
                         <View style={styles.rowBetween}>
                            <Text style={styles.ticketText}>Ticket #{item.entry?.entryNumber || item.entryId}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                    {statusConfig.text}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={styles.detailsText} numberOfLines={1}>
                            {item.entry?.brand} {item.entry?.model} • {item.operator?.name}
                        </Text>
                        
                        <View style={styles.transferContainer}>
                             {/* Origin */}
                             <View style={styles.locationNode}>
                                <Icon source="map-marker-outline" size={14} color="#64748b" />
                                <Text style={styles.locationText}>
                                     {sourceLocationName}
                                </Text>
                             </View>

                             {/* Arrow */}
                             <Icon source="arrow-right" size={16} color="#94a3b8" />

                             {/* Destination */}
                             <View style={styles.locationNode}>
                                <Icon source={item.status === 'COMPLETED' ? "map-marker-check" : "map-marker"} size={14} color={item.status === 'COMPLETED' ? "#166534" : "#1e40af"} />
                                <Text style={[styles.locationText, item.status === 'COMPLETED' && {color: '#166534', fontWeight: '600'}]}>
                                     {destinationLocationName}
                                </Text>
                             </View>
                        </View>
                        
                        <Text style={styles.timeText}>{dayjs(item.startedAt).format('DD MMM, HH:mm')}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[ModernStyles.screenContainer, { paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Buscar ticket, operador..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{minHeight: 0}}
                />
            </View>

            <FlatList
                data={filteredAssignments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                             <Icon source="key-variant" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>
                                {assignments.length === 0 ? "No hay asignaciones registradas" : "No se encontraron resultados"}
                            </Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    listContent: {
        padding: 16,
        paddingBottom: 100,
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
        backgroundColor: '#f3e8ff',
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
        marginBottom: 4,
    },
    ticketText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    timeText: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    detailsText: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
    },
    transferContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#f8fafc',
        padding: 8,
        borderRadius: 8,
        marginTop: 4,
    },
    locationNode: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#64748b',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
    },
});
