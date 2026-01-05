import { Alert, Linking } from 'react-native';
import { API_CONSTANTS } from '../../../core/constants/API_CONSTANTS';
import { get, post } from '../../../core/axios';

export interface KardexItem {
    id: string;
    entryNumber?: string;
    date: string;
    type: 'INGRESO' | 'SALIDA' | 'MOVIMIENTO' | 'LLAVES' | 'LLAVES_FIN';
    description: string;
    plates: string;
    clientName: string;
    operatorName: string;
    status: string;
    entry?: {
        entryNumber: string;
        id: number;
    };
}

export const getKardex = async () => {
    return await get<KardexItem[]>("/movements/kardex");
};

export const createMovement = async (data: { entryId: number; toLocationId: number; assignedUserId: number }) => {
    return await post("/movements", data);
};

export const downloadKardexPdf = async (filters: { startDate: string; endDate: string; operatorId?: string; userId?: string }, token: string) => {
    try {
        const { startDate, endDate, operatorId, userId } = filters;
        const queryParams = new URLSearchParams({
            startDate,
            endDate,
            ...(operatorId && { operatorId }),
            ...(userId && { userId })
        }).toString();

        if (!token) {
            Alert.alert("Error", "No autorizado. Inicie sesión nuevamente.");
            return;
        }

        const url = `${API_CONSTANTS.BASE_URL}/movements/kardex/pdf?${queryParams}`;

        const res = await get<{ url: string }>(`/movements/kardex/pdf?${queryParams}`);
        
        if (res.success && res.data?.url) {
             const baseUrl = API_CONSTANTS.BASE_URL.replace('/api/v1', '');
             const fullUrl = `${baseUrl}${res.data.url}`;
             await Linking.openURL(fullUrl);
        } else {
             Alert.alert("Error", "No se pudo generar el PDF.");
        }

    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Ocurrió un error al descargar el PDF");
    }
};
