import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Text, SegmentedButtons, HelperText, Menu, Button, Divider } from 'react-native-paper';

interface Props {
  formik: any;
  locations: any[];
}

export const GeneralDataStep = ({ formik, locations }: Props) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // Group locations (e.g., by aisle if name is like "A-1") or just list them
  // Assuming simple list for now
  const selectedLocation = locations.find(l => l.id === formik.values.locationId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Location Section */}
      <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.menuContainer}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button 
                        mode="outlined" 
                        onPress={openMenu} 
                        style={styles.locationButton}
                        contentStyle={styles.locationButtonContent}
                        icon="map-marker"
                    >
                        {selectedLocation ? selectedLocation.name : 'Seleccionar Cajón'}
                    </Button>
                }
                style={{ width: '90%' }}
            >
                <ScrollView style={{ maxHeight: 300 }}>
                    {locations.map((loc) => (
                        <Menu.Item 
                            key={loc.id} 
                            onPress={() => {
                                formik.setFieldValue('locationId', loc.id);
                                closeMenu();
                            }} 
                            title={loc.name}
                            leadingIcon={formik.values.locationId === loc.id ? 'check' : undefined}
                         />
                    ))}
                    {locations.length === 0 && <Menu.Item title="No hay lugares disponibles" disabled />}
                </ScrollView>
            </Menu>
          </View>
      </View>

      <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Detalles del Vehículo</Text>
          
          <TextInput
            label="Placas (Opcional)"
            value={formik.values.plates}
            onChangeText={formik.handleChange('plates')}
            onBlur={formik.handleBlur('plates')}
            mode="outlined"
            style={styles.input}
            contentStyle={{ fontWeight: 'bold', letterSpacing: 1 }}
            error={formik.touched.plates && !!formik.errors.plates}
            autoCapitalize="characters"
            maxLength={10}
            left={<TextInput.Icon icon="card-text-outline" color="#64748b" />}
          />
          {formik.touched.plates && formik.errors.plates && <HelperText type="error">{formik.errors.plates}</HelperText>}

          <View style={styles.row}>
              <View style={styles.halfInput}>
                <TextInput
                    label="Marca"
                    value={formik.values.brand}
                    onChangeText={formik.handleChange('brand')}
                    onBlur={formik.handleBlur('brand')}
                    mode="outlined"
                    style={styles.input}
                    error={formik.touched.brand && !!formik.errors.brand}
                />
              </View>
              <View style={[styles.halfInput, { marginLeft: 12 }]}>
                <TextInput
                    label="Modelo"
                    value={formik.values.model}
                    onChangeText={formik.handleChange('model')}
                    onBlur={formik.handleBlur('model')}
                    mode="outlined"
                    style={styles.input}
                    error={formik.touched.model && !!formik.errors.model}
                />
              </View>
          </View>

          <TextInput
            label="Color"
            value={formik.values.color}
            onChangeText={formik.handleChange('color')}
            onBlur={formik.handleBlur('color')}
            mode="outlined"
            style={styles.input}
            error={formik.touched.color && !!formik.errors.color}
            left={<TextInput.Icon icon="palette-outline" color="#64748b" />}
          />

          <TextInput
            label="Kilometraje (Opcional)"
            value={formik.values.mileage}
            onChangeText={formik.handleChange('mileage')}
            onBlur={formik.handleBlur('mileage')}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Icon icon="speedometer" color="#64748b" />}
          />


      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
      marginBottom: 24,
  },
  sectionTitle: {
      marginBottom: 12,
      fontWeight: 'bold',
      color: '#334155',
  },
  menuContainer: {
      marginBottom: 8,
  },
  locationButton: {
      borderRadius: 12,
      borderColor: '#cbd5e1',
      backgroundColor: '#f8fafc',
  },
  locationButtonContent: {
      height: 50,
      justifyContent: 'flex-start',
  },
  input: {
      marginBottom: 12,
      backgroundColor: '#fff',
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  halfInput: {
      flex: 1,
  }
});
