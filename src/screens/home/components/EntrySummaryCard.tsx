import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import ModernStyles from '../../../shared/theme/app.styles';

interface EntrySummaryCardProps {
  onPress: () => void;
  loading?: boolean;
}

export const EntrySummaryCard = ({ onPress, loading = false }: EntrySummaryCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, ModernStyles.shadowMd]}
    >
      <View style={styles.iconCircle}>
        <Icon source="car-arrow-right" size={32} color="#3b82f6" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Entradas</Text>
        <Text style={styles.subtitle}>Gestionar entradas de vehículos</Text>
      </View>

      <View style={styles.arrowContainer}>
        <Icon source="chevron-right" size={24} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff', // Blue-50
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b', // Slate-800
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', // Slate-500
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 8,
  },
});
