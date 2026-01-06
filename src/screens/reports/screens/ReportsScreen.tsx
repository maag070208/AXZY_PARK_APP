import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModernStyles from '../../../shared/theme/app.styles';
import { ReportsFilterModal } from '../components/ReportsFilterModal';
import { 
    DashboardMetrics, 
    getDashboardMetrics, 
    getReportList, 
    ReportItem,
    downloadFinancialReport,
    downloadOperatorsReport,
    downloadOccupancyReport,
    downloadInventoryReport,
    downloadDebtorsReport
} from '../services/ReportsService';

// Sub-components defined outside to avoid recreation on render
const StatusCard = ({ title, value, icon, color }: any) => (
    <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
        <Card.Content style={styles.cardContent}>
            <View>
                <Text variant="labelMedium" style={{color: '#64748b'}}>{title}</Text>
                <Text variant="headlineMedium" style={{fontWeight: 'bold', color: '#0f172a'}}>{value}</Text>
            </View>
            <IconButton icon={icon} iconColor={color} size={32} style={{margin: 0}} />
        </Card.Content>
    </Card>
);

const ReportButton = ({ title, icon, color, onPress }: any) => (
    <Card style={styles.reportCard} onPress={onPress}>
        <Card.Content style={styles.reportCardContent}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                <IconButton icon={icon} iconColor={color} size={24} style={{margin: 0}} />
            </View>
            <Text style={styles.reportTitle}>{title}</Text>
        </Card.Content>
    </Card>
);

// Helper function for status styles
const getStatusConfig = (status: string) => {
    switch (status) {
        case 'ACTIVE': return { bg: '#DCFCE7', text: '#166534', label: 'ACTIVO' };
        case 'MOVED': return { bg: '#FEF3C7', text: '#92400E', label: 'MOVIDO' };
        case 'EXITED': return { bg: '#DBEAFE', text: '#1E40AF', label: 'SALIDA' };
        case 'CANCELLED': return { bg: '#FEE2E2', text: '#DC2626', label: 'CANCELADO' };
        default: return { bg: '#F1F5F9', text: '#64748B', label: status };
    }
};

export const ReportsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [reportList, setReportList] = useState<ReportItem[]>([]);
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [listLoading, setListLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({ 
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'), 
        endDate: dayjs().endOf('month').format('YYYY-MM-DD') 
    });
    
    // Config for selected report download
    const [selectedReportType, setSelectedReportType] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setMetricsLoading(true);
            const metricsRes = await getDashboardMetrics();
            
            if (metricsRes.success && metricsRes.data) {
                setMetrics(metricsRes.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setMetricsLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchReports = useCallback(async () => {
        try {
            setListLoading(true);
            const res = await getReportList(filters);
            if (res.success && res.data) {
                setReportList(res.data);
            }
        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setListLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchData();
        fetchReports();
    }, [fetchData, fetchReports]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <IconButton 
                    icon="calendar-filter" 
                    mode="contained-tonal"
                    onPress={() => setShowFilter(true)} 
                />
            )
        });
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
        fetchReports();
    };

    const handleGenerateReport = async (type: string) => {
        if (type === 'INVENTORY') {
            await downloadInventoryReport();
        } else if (type === 'DEBTORS') {
            await downloadDebtorsReport();
        } else {
            setSelectedReportType(type);
            setShowFilter(true);
        }
    };

    const handleFilterSubmit = async (newFilters: { startDate: string, endDate: string }) => {
        if (selectedReportType) {
            try {
                if (selectedReportType === 'FINANCIAL') await downloadFinancialReport(newFilters);
                else if (selectedReportType === 'OPERATORS') await downloadOperatorsReport(newFilters);
                else if (selectedReportType === 'OCCUPANCY') await downloadOccupancyReport(newFilters);
            } catch (e) {
                console.error("Error downloading report", e);
            } finally {
                setShowFilter(false);
                setSelectedReportType(null);
            }
        } else {
            setFilters(newFilters);
            setShowFilter(false);
        }
    };

    const handleFilterDismiss = () => {
        setShowFilter(false);
        setSelectedReportType(null);
    };

    return (
        <View style={[ModernStyles.screenContainer, { paddingBottom: insets.bottom }]}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {metrics && (
                    <>
                        <View style={styles.grid}>
                            <View style={styles.col}>
                                <StatusCard 
                                    title="Ingresos Hoy" 
                                    value={`$${metrics.todaysIncome.toFixed(2)}`} 
                                    icon="cash" 
                                    color="#10b981" 
                                />
                            </View>
                            <View style={styles.col}>
                                <StatusCard 
                                    title="Ocupación" 
                                    value={`${metrics.occupancyPercentage}%`} 
                                    icon="percent" 
                                    color="#3b82f6" 
                                />
                            </View>
                        </View>

                        <View style={styles.grid}>
                             <View style={styles.col}>
                                <StatusCard 
                                    title="Autos Dentro" 
                                    value={metrics.carsInside} 
                                    icon="car" 
                                    color="#6366f1" 
                                />
                             </View>
                             <View style={styles.col}>
                                <StatusCard 
                                    title="Mov. Pendientes" 
                                    value={metrics.pendingMovements} 
                                    icon="clock-outline" 
                                    color="#f59e0b" 
                                />
                             </View>
                        </View>
                         <View style={styles.grid}>
                             <View style={styles.col}>
                                <StatusCard 
                                    title="Llaves Activas" 
                                    value={metrics.activeKeys} 
                                    icon="key" 
                                    color="#ef4444" 
                                />
                             </View>
                        </View>
                    </>
                )}

                <View style={{marginTop: 24, marginBottom: 8}}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>
                        Reportes Administrativos
                    </Text>
                    <View style={styles.reportsGrid}>
                        <ReportButton 
                            title="Financiero" 
                            icon="finance" 
                            color="#10b981" 
                            onPress={() => handleGenerateReport('FINANCIAL')} 
                        />
                        <ReportButton 
                            title="Operadores" 
                            icon="account-group" 
                            color="#3b82f6" 
                            onPress={() => handleGenerateReport('OPERATORS')} 
                        />
                        <ReportButton 
                            title="Inventario Patio" 
                            icon="car-multiple" 
                            color="#6366f1" 
                            onPress={() => handleGenerateReport('INVENTORY')} 
                        />
                        <ReportButton 
                            title="Flujo/Ocupación" 
                            icon="chart-timeline-variant" 
                            color="#f59e0b" 
                            onPress={() => handleGenerateReport('OCCUPANCY')} 
                        />
                        <ReportButton 
                            title="Deudores" 
                            icon="account-cash" 
                            color="#ef4444" 
                            onPress={() => handleGenerateReport('DEBTORS')} 
                        />
                    </View>
                </View>

                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Movimientos Detallados ({dayjs(filters.startDate).format('DD/MM')} - {dayjs(filters.endDate).format('DD/MM')})
                </Text>
                
                {reportList.map((item) => {
                    const statusStyle = getStatusConfig(item.status);
                    return (
                        <Card key={item.id} style={styles.listCard}>
                            <Card.Content style={styles.listRow}>
                                <View style={{flex: 1}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center'}}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                            <Text style={styles.listMain}>{item.plate}</Text>
                                            <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
                                                <Text style={[styles.badgeText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.listMain, { color: item.totalCost > 0 ? '#ef4444' : '#10b981' }]}>
                                            ${item.totalCost.toFixed(2)}
                                        </Text>
                                    </View>
                                    
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={styles.listSub}>{item.clientName} • {item.brand} {item.model}</Text>
                                        <Text style={styles.listDate}>{dayjs(item.entryDate).format('DD/MM HH:mm')}</Text>
                                    </View>
                                    {item.extraCosts > 0 && (
                                         <Text style={[styles.listSub, {color: '#f59e0b', marginTop: 2}]}>
                                            + ${item.extraCosts} extras
                                         </Text>
                                    )}
                                </View>
                            </Card.Content>
                        </Card>
                    );
                })}
                
                {reportList.length === 0 && !listLoading && (
                    <Text style={{color: '#94a3b8', textAlign: 'center', marginTop: 20}}>
                        No hay registros en este rango de fechas.
                    </Text>
                )}
            </ScrollView>

            <ReportsFilterModal 
                visible={showFilter}
                onDismiss={handleFilterDismiss}
                onSubmit={handleFilterSubmit}
                reportType={selectedReportType}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 16,
        paddingTop: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12
    },
    col: {
        flex: 1
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 2
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        color: '#334155'
    },
    listCard: {
        backgroundColor: 'white',
        marginBottom: 8,
        borderRadius: 12
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8
    },
    rank: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#64748b',
        width: 30
    },
    listMain: {
        fontWeight: '600',
        color: '#0f172a'
    },
    listSub: {
        fontSize: 12,
        color: '#64748b'
    },
    listDate: {
        fontSize: 12,
        color: '#94a3b8'
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    reportsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8
    },
    reportCard: {
        width: '48%', // Approx 2 columns
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8
    },
    reportCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12
    },
    iconContainer: {
        borderRadius: 8,
        marginRight: 8
    },
    reportTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
        flex: 1
    }
});
