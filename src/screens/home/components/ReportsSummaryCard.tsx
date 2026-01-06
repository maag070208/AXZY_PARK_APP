import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import ModernStyles from '../../../shared/theme/app.styles';

interface Props {
  onPress: () => void;
}

const ReportsSummaryCard = ({ onPress }: Props) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.container, ModernStyles.shadowMd]}
    >
      <View style={styles.iconCircle}>
        <Icon source="chart-bar" size={32} color="#8b5cf6" />
      </View>
      
      <View style={styles.content}>
        <Text variant="titleMedium" style={styles.title}>Reportes</Text>
        <Text variant="bodySmall" style={styles.subtitle}>
          Métricas y Configuración
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
    backgroundColor: '#ede9fe',
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

export default ReportsSummaryCard;
