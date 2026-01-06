import React, { useState, useEffect } from 'react';
import { View, Modal, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput, Searchbar, Text, Avatar, ActivityIndicator, IconButton, Surface, Portal } from 'react-native-paper';
import { getUsers, User } from '../services/UserService';

interface UserSearchInputProps {
    label: string;
    value?: User | null;
    onSelect: (user: User | null) => void;
    role?: 'ADMIN' | 'OPERATOR' | 'USER';
}

export const UserSearchInput = ({ label, value, onSelect, role }: UserSearchInputProps) => {
    const [visible, setVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async (query: string = '') => {
        setLoading(true);
        try {
            const res = await getUsers(query);
            if (res && res.data) {
                let filtered = res.data;
                if (role) {
                    filtered = filtered.filter((u: any) => u.role === role);
                }
                setUsers(filtered);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchUsers('');
        }
    }, [visible]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (visible) fetchUsers(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <View>
            <TouchableOpacity onPress={() => setTimeout(() => setVisible(true), 100)}>
                <View pointerEvents="none">
                    <TextInput
                        label={label}
                        value={value ? `${value.name} ${value.lastName || ''}` : ''}
                        mode="outlined"
                        style={styles.input}
                        right={<TextInput.Icon icon="magnify" />}
                    />
                </View>
            </TouchableOpacity>

            <Portal>
            <Modal visible={visible} onRequestClose={() => setVisible(false)} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <Surface style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text variant="titleMedium">Seleccionar {label}</Text>
                            <IconButton icon="close" onPress={() => setVisible(false)} />
                        </View>

                        <Searchbar
                            placeholder="Buscar..."
                            onChangeText={setSearchQuery}
                            value={searchQuery}
                            style={styles.searchBar}
                            elevation={0}
                        />

                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 20 }} />
                        ) : (
                            <FlatList
                                data={users}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.userItem} 
                                        onPress={() => {
                                            onSelect(item);
                                            setVisible(false);
                                        }}
                                    >
                                        <Avatar.Text 
                                            size={40} 
                                            label={item.name.substring(0, 2).toUpperCase()} 
                                            style={{ backgroundColor: '#e2e8f0' }}
                                            color="#475569"
                                        />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{item.name} {item.lastName}</Text>
                                            <Text variant="bodySmall" style={{ color: '#64748b' }}>{item.email}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron resultados</Text>}
                            />
                        )}
                    </Surface>
                </View>
            </Modal>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        marginBottom: 12,
        backgroundColor: 'white',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchBar: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        marginBottom: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#94a3b8',
    }
});
