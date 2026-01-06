import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import ModernStyles from '../../../shared/theme/app.styles';

interface Props {
  onPress: () => void;
}

const UsersSummaryCard = ({ onPress }: Props) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, ModernStyles.shadowMd]}
    >
      <View style={styles.iconCircle}>
        <Icon source="account-group" size={32} color="#0ea5e9" />
      </View>
      
      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>Usuarios</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Administrar Usuarios
        </Text>
      </View>

      <View style={styles.arrowContainer}>
        <Icon source="chevron-right" size={24} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#0f172a',
    fontSize: 16,
  },
  subtitle: {
    color: '#64748b',
    marginTop: 2,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UsersSummaryCard;
