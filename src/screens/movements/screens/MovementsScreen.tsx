import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Icon, IconButton, Searchbar, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../core/store/hooks';
import { RootState } from '../../../core/store/redux.config';
import ModernStyles from '../../../shared/theme/app.styles';
import { KardexFilterModal } from '../components/KardexFilterModal';
import { downloadKardexPdf, getKardex, KardexItem, } from '../services/MovementsService';
import { HeaderBack } from '../../../navigation/header/HeaderBack';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';

export const MovementsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [movements, setMovements] = useState<KardexItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();

    const fetchMovements = useCallback(async () => {
        try {
            const res = await getKardex().catch((error) => {
                console.error("Error fetching movements:", error);
                return { success: false, data: null };
            });
            console.log(res);
            if (res.success && res.data) {
                setMovements(res.data);
            }
        } catch (error) {
            console.error("Error fetching movements:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchMovements();
    }, [fetchMovements]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMovements();
    };

    const filteredMovements = useMemo(() => {
        if (!searchQuery) return movements;
        const query = searchQuery.toLowerCase();
        return movements.filter((item) => {
            const ticket = item.entry?.entryNumber || item.entryNumber || '';
            return (
                ticket.toLowerCase().includes(query) ||
                (item.operatorName && item.operatorName.toLowerCase().includes(query)) ||
                (item.clientName && item.clientName.toLowerCase().includes(query))
            );
        });
    }, [movements, searchQuery]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'INGRESO': return { bg: '#dcfce7', text: '#166534', icon: 'login' };
            case 'SALIDA': return { bg: '#fee2e2', text: '#b91c1c', icon: 'logout' };
            case 'MOVIMIENTO': return { bg: '#eff6ff', text: '#1e40af', icon: 'car-shift-pattern' };
            case 'LLAVES': return { bg: '#fef9c3', text: '#854d0e', icon: 'key' };
            case 'LLAVES_FIN': return { bg: '#f3e8ff', text: '#6b21a8', icon: 'car-key' };
            default: return { bg: '#f1f5f9', text: '#475569', icon: 'circle-small' };
        }
    };

    const renderItem = ({ item }: { item: KardexItem }) => {
        const style = getTypeColor(item.type);
        const ticketNumber = item.entry?.entryNumber || item.entryNumber || '---';

        return (
            <View style={styles.itemContainer}>
                {/* Icon Column */}
                <View style={[styles.iconContainer, { backgroundColor: style.bg }]}>
                    <Icon source={style.icon} size={24} color={style.text} />
                </View>

                {/* Content Column */}
                <View style={styles.infoContainer}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.ticketLabel}>Ticket #{ticketNumber}</Text>
                        <Text style={styles.timeText}>{dayjs(item.date).format('HH:mm')}</Text>
                    </View>

                    <Text style={styles.plateText}>{item.plates}</Text>

                    <View style={styles.rowBetween}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginTop: 4}}>
                             <View style={[styles.badge, { backgroundColor: style.bg }]}>
                                <Text style={[styles.badgeText, { color: style.text }]}>{item.type}</Text>
                             </View>
                            <Text style={styles.detailsText} numberOfLines={1}>
                                • {item.operatorName || item.clientName}
                            </Text>
                        </View>
                        <Text style={styles.dateText}>{dayjs(item.date).format('DD/MM')}</Text>
                    </View>
                    
                    {item.description ? (
                         <Text style={styles.descriptionText} numberOfLines={1}>{item.description}</Text>
                    ) : null}
                </View>
            </View>
        );
    };

    const [showFilterModal, setShowFilterModal] = useState(false);
    const token = useAppSelector((state:RootState) => state.userState.token);

    const onGeneratePdf = async (filters: any) => {
        setLoading(true);
        if (token) {
            await downloadKardexPdf(filters, token);
            console.log("filters", filters);
            console.log("token", token);
        } else {
            dispatch(showToast({
                message: "No se pudo generar el PDF.",
                type: "error",
            }))
        }
        setLoading(false);
    };

    useEffect(() => {
        navigation.setOptions({
            header: () => (
                <View>
                     <HeaderBack
                        navigation={navigation}
                        title="Movimientos"
                        right={() => (
                            <View style={{ flexDirection: 'row', marginRight: 8 }}>
                                <IconButton 
                                    icon="file-pdf-box" 
                                    size={28} 
                                    iconColor="#ef4444" 
                                    onPress={() => setShowFilterModal(true)} 
                                />
                            </View>
                        )}
                    />
                    <View style={styles.searchContainer}>
                        <Searchbar
                            placeholder="Buscar ticket, operador..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                            inputStyle={{minHeight: 0}}
                        />
                    </View>
                </View>
            )
        });
    }, [navigation, searchQuery]);

    return (
        <View style={[ModernStyles.screenContainer, { paddingBottom: insets.bottom }]}>
            <FlatList
                data={filteredMovements}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                           <Icon source="history" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>
                                {movements.length === 0 ? "No hay movimientos registrados" : "No se encontraron resultados"}
                            </Text>
                        </View>
                    ) : null
                }
            />

            <KardexFilterModal 
                visible={showFilterModal}
                onDismiss={() => setShowFilterModal(false)}
                onSubmit={onGeneratePdf}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    listContent: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#ffffff',
    },
    searchBar: {
        backgroundColor: '#f1f5f9',
        elevation: 0,
        height: 48,
        borderRadius: 12,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        marginBottom: 8,
        borderRadius: 12,
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
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    ticketLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    plateText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
        marginVertical: 2,
    },
    timeText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    detailsText: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
    },
    dateText: {
        fontSize: 11,
        color: '#cbd5e1',
    },
    descriptionText: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
    },
});
