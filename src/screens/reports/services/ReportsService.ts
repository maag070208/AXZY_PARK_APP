import { get, put } from "../../../core/axios";

export interface DashboardMetrics {
    todaysIncome: number;
    carsInside: number;
    occupancyPercentage: number;
    pendingMovements: number;
    activeKeys: number;
    topDebtors: any[];
    topOperators: any[];
}

export interface SystemConfig {
    maxCapacity: number;
    dayCost: number;
}

export interface ReportItem {
    id: number;
    entryDate: string;
    exitDate?: string;
    status: string;
    plate: string;
    brand: string;
    model: string;
    clientName: string;
    totalCost: number;
    extraCosts: number;
    parkingCost: number;
}

export const getDashboardMetrics = async () => {
    return await get<DashboardMetrics>("/reports/dashboard");
};

export const getReportList = async (filters: { startDate?: string, endDate?: string }) => {
    // Build query params
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    
    return await get<ReportItem[]>(`/reports/list?${params.toString()}`);
};

export const getSystemConfig = async () => {
    return await get<SystemConfig>("/config");
};

export const updateSystemConfig = async (maxCapacity: number, dayCost: number) => {
    return await put<SystemConfig>("/config", { maxCapacity, dayCost });
};

import { Alert, Linking } from "react-native";
import { API_CONSTANTS } from "../../../core/constants/API_CONSTANTS";

export const downloadReportPdf = async (endpoint: string, filters: { startDate: string, endDate: string }) => {
    try {
        const queryParams = new URLSearchParams({
            startDate: filters.startDate,
            endDate: filters.endDate
        }).toString();
        
        const res = await get<{ url: string }>(`${endpoint}?${queryParams}`);
        
        if (res.success && res.data?.url) {
             const baseUrl = API_CONSTANTS.BASE_URL.replace('/api/v1', '');
             const fullUrl = `${baseUrl}${res.data.url}`;
             await Linking.openURL(fullUrl);
        } else {
             Alert.alert("Error", "No se pudo generar el reporte.");
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Ocurrió un error al descargar el reporte");
    }
};

export const downloadFinancialReport = (filters: { startDate: string, endDate: string }) => 
    downloadReportPdf("/reports/financial/pdf", filters);

export const downloadOperatorsReport = (filters: { startDate: string, endDate: string }) => 
    downloadReportPdf("/reports/operators/pdf", filters);

export const downloadOccupancyReport = (filters: { startDate: string, endDate: string }) => 
    downloadReportPdf("/reports/occupancy/pdf", filters);

export const downloadInventoryReport = async () => {
    try {
        const res = await get<{ url: string }>("/reports/inventory/pdf");
        if (res.success && res.data?.url) {
             const baseUrl = API_CONSTANTS.BASE_URL.replace('/api/v1', '');
             const fullUrl = `${baseUrl}${res.data.url}`;
             await Linking.openURL(fullUrl);
        } else {
             Alert.alert("Error", "No se pudo generar el reporte.");
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Ocurrió un error al descargar el reporte.");
    }
};

export const downloadDebtorsReport = async () => {
    try {
        const res = await get<{ url: string }>("/reports/debtors/pdf");
        if (res.success && res.data?.url) {
             const baseUrl = API_CONSTANTS.BASE_URL.replace('/api/v1', '');
             const fullUrl = `${baseUrl}${res.data.url}`;
             await Linking.openURL(fullUrl);
        } else {
             Alert.alert("Error", "No se pudo generar el reporte.");
        }
    } catch (error) {
        console.error(error);
        Alert.alert("Error", "Ocurrió un error al descargar el reporte.");
    }
};
