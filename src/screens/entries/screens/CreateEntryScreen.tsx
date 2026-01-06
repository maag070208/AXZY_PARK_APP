import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, ProgressBar, useTheme, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { UserSelectionStep } from '../components/steps/UserSelectionStep';
import { GeneralDataStep } from '../components/steps/GeneralDataStep';
import { PhotoUploadStep } from '../components/steps/PhotoUploadStep';
import { ConfirmationStep } from '../components/steps/ConfirmationStep';
import { ExtrasStep } from '../components/steps/ExtrasStep';
import { getLocations, Location } from '../../locations/services/LocationsService'; 
import { createEntry } from '../services/EntriesService';
import { getVehicleTypes, VehicleType } from '../../config/services/VehicleTypesService';
import { showToast } from '../../../core/store/slices/toast.slice';
import { useAppDispatch, useAppSelector } from '../../../core/store/hooks';
import CustomKeyboardAvoidingScrollView from '../../../shared/components/CustomKeyboardAvoidingScrollView';

export const CreateEntryScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const operatorUserId  = useAppSelector((state) => state.userState.id);
  
  // User Selection State
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Steps Configuration
  const steps = [
      { title: 'Cliente' }, 
      { title: 'Datos Generales' },
      { title: 'Exterior' },
      { title: 'Laterales' },
      { title: 'Interior' },
      { title: 'Extras y Notas' }, // New Step
      { title: 'Confirmación' }
  ];

  useEffect(() => {
    getLocations().then(res => {
        if (res && res.data) {
            setLocations(res.data);
        }
    });
    getVehicleTypes().then(res => {
        if (res && res.data) {
            setVehicleTypes(res.data);
        }
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      locationId: '',
      vehicleTypeId: '',
      brand: '',
      model: '',
      color: '',
      plates: '',
      series: '', // Added series
      mileage: '',
      notes: '',
      photos: {} as Record<string, string>,
      extrasList: [] as any[], 
    },
    validationSchema: Yup.object({
        locationId: Yup.string().required('Ubicación requerida'),
        vehicleTypeId: Yup.string().required('Tipo de vehículo requerido'),
        brand: Yup.string().required('Marca es requerida'),
        model: Yup.string().required('Modelo es requerido'),
        color: Yup.string().required('Color es requerido'),
        plates: Yup.string().notRequired(),
        series: Yup.string().notRequired(),
        mileage: Yup.number().typeError('Debe ser número'),
    }),
    onSubmit: async (values) => {
        if (!selectedUserId) {
            Alert.alert('Error', 'Selecciona un usuario');
            return;
        }

        try {
            const formData = new FormData();
            formData.append("userId", String(selectedUserId));
            formData.append("operatorUserId", String(operatorUserId));
            
            if (values.locationId) formData.append("locationId", values.locationId);
            if (values.vehicleTypeId) formData.append("vehicleTypeId", values.vehicleTypeId);
            
            formData.append("brand", values.brand);
            formData.append("model", values.model);
            formData.append("color", values.color);
            if (values.plates) formData.append("plates", values.plates);
            if (values.series) formData.append("series", values.series); // Added series

            if (values.mileage) formData.append("mileage", String(values.mileage));
            if (values.notes) formData.append("notes", values.notes);

            const photosPayload: { category: string; imageUrl: string; description?: string }[] = [];
            
            // Standard photos
            Object.keys(values.photos).forEach((key) => {
                const url = values.photos[key];
                if (url) photosPayload.push({ category: key, imageUrl: url });
            });

            // Extras
            if (values.extrasList && values.extrasList.length > 0) {
                values.extrasList.forEach((extra) => {
                    photosPayload.push({
                        category: 'extra', 
                        imageUrl: extra.imageUrl,
                        description: extra.description
                    });
                });
            }

            formData.append("photos", JSON.stringify(photosPayload));

            const res = await createEntry(formData);
            if (res && res.data) {
                // Determine Ticket ID from response
                const ticketId = res.data.entryNumber;
                
                Alert.alert(
                    "Entrada Exitosa",
                    `Ticket Generado: ${ticketId}\n\nEl vehículo ha sido registrado correctamente.`,
                    [
                        { 
                            text: "Aceptar", 
                            onPress: () => navigation.goBack() 
                        }
                    ]
                );
            } else {
                dispatch(showToast({ type: 'error', message: 'Error al registrar entrada' }));
            }

        } catch (e) {
            dispatch(showToast({ type: 'error', message: 'Error de conexión' }));
        }
    },
  });

  const handleNext = () => {
      if (step === 0 && !selectedUserId) {
          Alert.alert('Requerido', 'Seleccione un cliente para continuar.');
          return;
      }
      if (step === 1) { // Validate General Data (ignoring plates)
          const errors = startValidation();
          if (Object.keys(errors).length > 0) {
              formik.setTouched({
                  locationId: true, vehicleTypeId: true, brand: true, model: true, color: true
              });
              return;
          }
      }
      
      if (step < steps.length - 1) {
          setStep(step + 1);
      } else {
          formik.submitForm();
      }
  };

  const startValidation = () => {
      formik.validateForm(); 
      const errors: any = {};
      if (!formik.values.locationId) errors.locationId = true;
      if (!formik.values.vehicleTypeId) errors.vehicleTypeId = true;
      if (!formik.values.brand) errors.brand = true;
      if (!formik.values.model) errors.model = true;
      if (!formik.values.color) errors.color = true;
      return errors;
  };

  const renderContent = () => {
      switch (step) {
          case 0:
              return (
                  <UserSelectionStep 
                    selectedUserId={selectedUserId}
                    setSelectedUserId={(id) => {
                        setSelectedUserId(id);
                        if (id) setStep(1); // Auto-advance
                    }}
                    users={users}
                    setUsers={setUsers}
                    onVehicleSelected={(v) => {
                        const newPhotos: any = {};
                        if (v.photos && Array.isArray(v.photos)) {
                             v.photos.forEach((p: any) => {
                                 if (p.category && p.imageUrl) newPhotos[p.category] = p.imageUrl;
                             });
                        }
                        formik.setValues({
                            ...formik.values,
                            brand: v.brand,
                            model: v.model,
                            color: v.color,
                            plates: v.plates,
                            photos: newPhotos, 
                        });
                        setStep(1); 
                    }}
                  />
              );
          case 1:
              return <GeneralDataStep formik={formik} locations={locations} vehicleTypes={vehicleTypes} />;
          case 2:
              return <PhotoUploadStep title="" categories={[{ key: 'frontal', label: 'Frontal' }, { key: 'trasera', label: 'Trasera' }]} formik={formik} />;
          case 3:
              return <PhotoUploadStep title="" categories={[{ key: 'lateral_derecho', label: 'Lateral Derecho' }, { key: 'lateral_izquierdo', label: 'Lateral Izquierdo' }]} formik={formik} />;
          case 4:
              return <PhotoUploadStep title="" categories={[{ key: 'interior', label: 'Interior' }]} formik={formik} />;
          case 5:
              return <ExtrasStep formik={formik} />;
          case 6:
              return <ConfirmationStep formik={formik} locations={locations} vehicleTypes={vehicleTypes} />;
          default:
              return null;
      }
  };

  return (
    <View style={styles.container}>
      <ProgressBar progress={(step + 1) / steps.length} color={theme.colors.primary} style={styles.progressBar} />
      
      <CustomKeyboardAvoidingScrollView 
        contentContainerStyle={styles.scrollContent}
        stickyFooter={
             <View style={styles.footerContainer}>
                {step > 0 && (
                    <Button 
                      mode="outlined" 
                      onPress={() => setStep(step - 1)}
                      style={[styles.button, styles.backButton]}
                      labelStyle={styles.buttonLabel}
                    >
                        Atrás
                    </Button>
                )}
                <Button 
                  mode="contained" 
                  onPress={handleNext} 
                  style={[styles.button, styles.nextButton]}
                  buttonColor={theme.colors.primary}
                  labelStyle={styles.buttonLabel}
                >
                    {step === steps.length - 1 ? 'Finalizar Entrada' : 'Siguiente'}
                </Button>
            </View>
        }
      >
        <View style={styles.header}>
            <Text style={styles.stepTitle}>{steps[step].title}</Text>
            <Text style={styles.stepSubtitle}>Paso {step + 1} de {steps.length}</Text>
        </View>

        <View style={styles.content}>
            {renderContent()}
        </View>
      </CustomKeyboardAvoidingScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressBar: {
      height: 4,
  },
  scrollContent: {
      flexGrow: 1,
      paddingBottom: 20, 
  },
  header: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
  },
  stepTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1e293b',
      letterSpacing: -0.5,
  },
  stepSubtitle: {
      fontSize: 14,
      color: '#64748b',
      marginTop: 4,
      fontWeight: '500',
  },
  content: {
      flex: 1,
  },
  footerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
  },
  button: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 6,
  },
  backButton: {
      borderColor: '#e2e8f0',
  },
  nextButton: {
      elevation: 0,
  },
  buttonLabel: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
  }
});
