import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import ModernStyles from '../../../shared/theme/app.styles';

interface LocationsSummaryCardProps {
  onPress: () => void;
  loading?: boolean;
}

export const LocationsSummaryCard = ({ onPress, loading = false }: LocationsSummaryCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, ModernStyles.shadowMd]}
    >
      <View style={styles.iconCircle}>
        <Icon source="map-marker-multiple" size={32} color="#10b981" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Ubicaciones</Text>
        <Text style={styles.subtitle}>Gestionar zonas y espacios</Text>
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
    backgroundColor: '#ecfdf5', // Emerald-50
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
