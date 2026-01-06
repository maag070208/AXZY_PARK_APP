import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { Avatar, FAB, Searchbar, Surface, Text, Portal, Modal, Button, IconButton, Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, getUsers } from '../services/UserService';
import ModernStyles from '../../../shared/theme/app.styles';
import { theme } from '../../../shared/theme/theme';

export const UsersScreen = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getUsers(searchQuery);
            if (res.success && res.data) {
                setUsers(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUsers();
        });
        return unsubscribe;
    }, [navigation, fetchUsers]);

    const handleUserPress = (user: User) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: User }) => (
        <TouchableOpacity onPress={() => handleUserPress(item)} activeOpacity={0.7}>
            <Surface style={styles.card} elevation={0}>
                <View style={styles.row}>
                    <Avatar.Text 
                        size={48} 
                        label={item.name.substring(0, 2).toUpperCase()} 
                        style={{ backgroundColor: '#e0f2fe' }} 
                        color="#0284c7"
                    />
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name} {item.lastName}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <View style={styles.roleContainer}>
                            <View style={[styles.badge, { backgroundColor: item.role === 'ADMIN' ? '#fef3c7' : '#dcfce7' }]}>
                                <Text style={[styles.badgeText, { color: item.role === 'ADMIN' ? '#d97706' : '#15803d' }]}>
                                    {item.role === 'USER' ? 'USUARIO' : item.role === 'OPERATOR' ? 'OPERADOR' : item.role}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Surface>
        </TouchableOpacity>
    );

    return (
        <View style={[ModernStyles.screenContainer, { paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Buscar usuario..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{minHeight: 0}}
                    onSubmitEditing={fetchUsers}
                />
            </View>

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
            />

            <FAB
                icon="plus"
                style={[styles.fab, { bottom: insets.bottom + 16 }]}
                onPress={() => navigation.navigate('CREATE_USER_SCREEN')}
                color="white"
            />

            {/* USER DETAILS MODAL */}
            <Portal>
                <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modalContent}>
                    {selectedUser && (
                        <View>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Detalles del Usuario</Text>
                                <IconButton icon="close" size={24} onPress={() => setModalVisible(false)} />
                            </View>
                            
                            <ScrollView style={{ maxHeight: 400 }}>
                                <View style={styles.modalBody}>
                                    <View style={styles.avatarContainer}>
                                        <Avatar.Text 
                                            size={80} 
                                            label={selectedUser.name.substring(0, 2).toUpperCase()} 
                                            style={{ backgroundColor: theme.colors.primaryContainer }} 
                                            color={theme.colors.primary}
                                        />
                                        <Text style={styles.modalName}>{selectedUser.name} {selectedUser.lastName}</Text>
                                        <Text style={styles.modalEmail}>{selectedUser.email}</Text>
                                    </View>

                                    <Divider style={styles.divider} />

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Rol:</Text>
                                        <View style={[styles.badge, { backgroundColor: selectedUser.role === 'ADMIN' ? '#fef3c7' : '#dcfce7', alignSelf: 'flex-start' }]}>
                                            <Text style={[styles.badgeText, { color: selectedUser.role === 'ADMIN' ? '#d97706' : '#15803d', fontSize: 12 }]}>
                                                {selectedUser.role === 'USER' ? 'USUARIO' : selectedUser.role === 'OPERATOR' ? 'OPERADOR' : selectedUser.role}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Estado:</Text>
                                        <Text style={[styles.detailValue, { color: selectedUser.active ? 'green' : 'red' }]}>
                                            {selectedUser.active ? 'Activo' : 'Inactivo'}
                                        </Text>
                                    </View>

                                    {selectedUser.role === 'OPERATOR' && (
                                        <>
                                            <Divider style={styles.divider} />
                                            <Text style={styles.sectionTitle}>Horario de Turno</Text>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Inicio:</Text>
                                                <Text style={styles.detailValue}>{selectedUser.shiftStart || 'N/A'}</Text>
                                            </View>
                                            <View style={styles.detailRow}>
                                                <Text style={styles.detailLabel}>Fin:</Text>
                                                <Text style={styles.detailValue}>{selectedUser.shiftEnd || 'N/A'}</Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </ScrollView>

                            <Button mode="contained" onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                Cerrar
                            </Button>
                        </View>
                    )}
                </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 16,
        backgroundColor: '#fff',
    },
    searchBar: {
        backgroundColor: '#f1f5f9',
        elevation: 0,
        height: 48,
        borderRadius: 12,
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    roleContainer: {
        marginTop: 6,
        flexDirection: 'row',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        backgroundColor: '#0ea5e9',
        borderRadius: 16,
    },
    // Modal Styles
    modalContent: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    modalBody: {
        paddingVertical: 10,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 12,
        color: '#0f172a',
    },
    modalEmail: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    divider: {
        marginVertical: 16,
        backgroundColor: '#e2e8f0',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 16,
        color: '#0f172a',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    closeButton: {
        marginTop: 10,
        borderRadius: 12,
    }
});
