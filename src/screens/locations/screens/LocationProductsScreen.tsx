import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { theme } from '../../../shared/theme/theme';

interface Props {
  route: any;
  navigation: any;
}

export const LocationProductsScreen = ({ route }: Props) => {
  const { locationId } = route.params;
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setLoading(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.productName}>
            {item.product?.name}
          </Text>
          <View style={styles.qtyContainer}>
            <Text variant="labelMedium" style={styles.qtyLabel}>
              Stock
            </Text>
            <Text variant="titleLarge" style={styles.qtyValue}>
              {item.quantity}
            </Text>
            <Text variant="labelSmall" style={styles.unit}>
              {item.product?.unitMeasure}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>
              SKU
            </Text>
            <Text variant="bodyMedium">{item.product?.code}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text variant="labelSmall" style={styles.detailLabel}>
              EAN
            </Text>
            <Text variant="bodyMedium">{item.product?.barcode}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            animating={true}
            size="large"
            color={theme.colors.primary}
          />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={stock}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="titleLarge" style={styles.emptyStateTitle}>
                Sin productos
              </Text>
              <Text variant="bodyMedium" style={styles.emptyStateText}>
                Esta ubicación no tiene productos asignados
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productName: {
    flex: 1,
    fontWeight: '600',
    marginRight: 12,
  },
  qtyContainer: {
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  qtyLabel: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  qtyValue: {
    fontWeight: '700',
    color: '#15803d',
  },
  unit: {
    color: '#166534',
    fontSize: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {},
  detailLabel: {
    color: '#94a3b8',
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateTitle: {
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#94a3b8',
  },
});
