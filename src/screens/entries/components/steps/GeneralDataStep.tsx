import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

interface Props {
  formik: any;
  locations: any[];
  vehicleTypes: any[];
}

export const GeneralDataStep = ({ formik, locations, vehicleTypes }: Props) => {
  // Group locations (e.g., by aisle if name is like "A-1") or just list them
  // Assuming simple list for now


  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Location Section */}
      <View style={styles.section}>
          <View style={styles.menuContainer}>
            <Dropdown
                label="Ubicación"
                hideMenuHeader
                placeholder="Seleccionar Cajón"
                options={locations.map(l => ({ label: l.name, value: String(l.id) }))}
                value={formik.values.locationId ? String(formik.values.locationId) : undefined}
                onSelect={(val) => formik.setFieldValue('locationId', Number(val))}
                mode="outlined"
                error={formik.touched.locationId && !!formik.errors.locationId}
                menuContentStyle={{ 
                    backgroundColor: '#fff',
                    padding: 0,
                    borderRadius: 12,
                 }}
            />
            {formik.touched.locationId && formik.errors.locationId && (
                <HelperText type="error">{formik.errors.locationId}</HelperText>
            )}
          </View>
      </View>

      <View style={styles.section}>
          <View style={styles.menuContainer}>
            <Dropdown
                label="Tipo de Vehículo"
                placeholder="Seleccionar Tipo"
                hideMenuHeader
                options={vehicleTypes.map(t => ({ label: `${t.name} - $${t.cost}`, value: String(t.id) }))}
                value={formik.values.vehicleTypeId ? String(formik.values.vehicleTypeId) : undefined}
                onSelect={(val) => formik.setFieldValue('vehicleTypeId', Number(val))}
                mode="outlined"
                error={formik.touched.vehicleTypeId && !!formik.errors.vehicleTypeId}
                menuContentStyle={{ 
                    backgroundColor: '#fff',
                    padding: 0,
                    borderRadius: 12,
                 }}
            />
            {formik.touched.vehicleTypeId && formik.errors.vehicleTypeId && (
                <HelperText type="error">{formik.errors.vehicleTypeId}</HelperText>
            )}
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

          <TextInput
            label="Serie (Opcional)"
            value={formik.values.series}
            onChangeText={formik.handleChange('series')}
            onBlur={formik.handleBlur('series')}
            mode="outlined"
            style={styles.input}
            contentStyle={{ letterSpacing: 1 }}
            error={formik.touched.series && !!formik.errors.series}
            autoCapitalize="characters"
            left={<TextInput.Icon icon="barcode" color="#64748b" />}
          />

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
