import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import CustomKeyboardAvoidingScrollView from '../../../shared/components/CustomKeyboardAvoidingScrollView';
import { createUser } from '../services/UserService';
import ModernStyles from '../../../shared/theme/app.styles';
import { useDispatch } from 'react-redux';
import { showToast } from '../../../core/store/slices/toast.slice';

const CreateUserSchema = Yup.object().shape({
    name: Yup.string().required('Requerido'),
    lastName: Yup.string().required('Requerido'),
    email: Yup.string().email('Email inválido').required('Requerido'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Requerido'),
    role: Yup.string().required('Requerido'),
    shiftStart: Yup.string().when('role', {
        is: 'OPERATOR',
        then: (schema) => schema.required('Requerido').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm (Ej: 08:00)'), 
        otherwise: (schema) => schema.notRequired()
    }),
    shiftEnd: Yup.string().when('role', {
        is: 'OPERATOR',
        then: (schema) => schema.required('Requerido').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:mm (Ej: 16:00)'),
        otherwise: (schema) => schema.notRequired()
    }),
});

export const CreateUserScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleCreate = async (values: any) => {
        try {
            setLoading(true);
            const res = await createUser(values).catch((error) => {
                console.log(error);
                dispatch(showToast({ message: error.message || "Ocurrió un error", type: 'error' }));
                setLoading(false);
                return { success: false, messages: [error.message || "Ocurrió un error"] };
            });
            console.log(res);
            if (res.success) {
                dispatch(showToast({ message: "Usuario creado correctamente", type: 'success' }));
                navigation.goBack();
            } else {
                const msg = res.messages ? res.messages[0] : (res.messages || "No se pudo crear el usuario");
                dispatch(showToast({ message: msg, type: 'error' }));
            }
        } catch (error: any) {
            dispatch(showToast({ message: error.message || "Ocurrió un error", type: 'error' }));
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={ModernStyles.screenContainer}>
            <Formik
                initialValues={{ name: '', lastName: '', email: '', password: '', role: 'USER', shiftStart: '', shiftEnd: '' }}
                validationSchema={CreateUserSchema}
                onSubmit={handleCreate}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
                    <>
                    <CustomKeyboardAvoidingScrollView
                        stickyFooter={
                            <Button 
                                mode="contained" 
                                onPress={() => handleSubmit()} 
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                            >
                                Crear Usuario
                            </Button>
                        }
                    >
                        <View style={styles.form}>

                            <TextInput
                                mode="outlined"
                                label="Nombre"
                                value={values.name}
                                onChangeText={handleChange('name')}
                                onBlur={handleBlur('name')}
                                error={touched.name && !!errors.name}
                                style={styles.input}
                            />
                            <HelperText type="error" visible={touched.name && !!errors.name}>
                                {errors.name}
                            </HelperText>

                            <TextInput
                                mode="outlined"
                                label="Apellido"
                                value={values.lastName}
                                onChangeText={handleChange('lastName')}
                                onBlur={handleBlur('lastName')}
                                error={touched.lastName && !!errors.lastName}
                                style={styles.input}
                            />
                            <HelperText type="error" visible={touched.lastName && !!errors.lastName}>
                                {errors.lastName}
                            </HelperText>

                            <TextInput
                                mode="outlined"
                                label="Correo Electrónico"
                                value={values.email}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                error={touched.email && !!errors.email}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                            />
                            <HelperText type="error" visible={touched.email && !!errors.email}>
                                {errors.email}
                            </HelperText>

                            <TextInput
                                mode="outlined"
                                label="Contraseña"
                                value={values.password}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                error={touched.password && !!errors.password}
                                secureTextEntry
                                style={styles.input}
                            />
                            <HelperText type="error" visible={touched.password && !!errors.password}>
                                {errors.password}
                            </HelperText>

                            <Text style={styles.label}>Rol</Text>
                            <SegmentedButtons
                                value={values.role}
                                onValueChange={val => setFieldValue('role', val)}
                                buttons={[
                                    { value: 'USER', label: 'USUARIO' },
                                    { value: 'OPERATOR', label: 'OPERADOR' },
                                    { value: 'ADMIN', label: 'ADMIN' },
                                ]}
                                style={styles.segmentedButton}
                            />

                            {values.role === 'OPERATOR' && (
                                <View style={{ marginTop: 8 }}>
                                    <Text style={styles.label}>Horario de Turno</Text>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity onPress={() => setShowStartPicker(true)}>
                                                <TextInput
                                                    mode="outlined"
                                                    label="Inicio Turno"
                                                    value={values.shiftStart}
                                                    editable={false}
                                                    style={styles.input}
                                                    right={<TextInput.Icon icon="clock-outline" onPress={() => setShowStartPicker(true)} />}
                                                />
                                            </TouchableOpacity>
                                            <HelperText type="error" visible={touched.shiftStart && !!errors.shiftStart}>
                                                {errors.shiftStart}
                                            </HelperText>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <TouchableOpacity onPress={() => setShowEndPicker(true)}>
                                                <TextInput
                                                    mode="outlined"
                                                    label="Fin Turno"
                                                    value={values.shiftEnd}
                                                    editable={false}
                                                    style={styles.input}
                                                    right={<TextInput.Icon icon="clock-outline" onPress={() => setShowEndPicker(true)} />}
                                                />
                                            </TouchableOpacity>
                                            <HelperText type="error" visible={touched.shiftEnd && !!errors.shiftEnd}>
                                                {errors.shiftEnd}
                                            </HelperText>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </CustomKeyboardAvoidingScrollView>

                    <TimePickerModal
                        visible={showStartPicker}
                        onDismiss={() => setShowStartPicker(false)}
                        onConfirm={({ hours, minutes }) => {
                            setShowStartPicker(false);
                            const h = hours < 10 ? `0${hours}` : hours;
                            const m = minutes < 10 ? `0${minutes}` : minutes;
                            setFieldValue('shiftStart', `${h}:${m}`);
                        }}
                        hours={8} 
                        minutes={0}
                    />
                    
                    <TimePickerModal
                        visible={showEndPicker}
                        onDismiss={() => setShowEndPicker(false)}
                        onConfirm={({ hours, minutes }) => {
                            setShowEndPicker(false);
                            const h = hours < 10 ? `0${hours}` : hours;
                            const m = minutes < 10 ? `0${minutes}` : minutes;
                            setFieldValue('shiftEnd', `${h}:${m}`);
                        }}
                        hours={16}
                        minutes={0}
                    />
                    </>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    form: {
        padding: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    input: {
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    segmentedButton: {
        marginBottom: 24,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 6,
        marginHorizontal: 20,
        marginBottom: 20,
    }
});
