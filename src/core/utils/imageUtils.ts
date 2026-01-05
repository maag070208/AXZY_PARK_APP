import { API_CONSTANTS } from "../constants/API_CONSTANTS";
import { Platform } from "react-native";

export const getFullImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    // API_CONSTANTS.BASE_URL is typically "http://10.0.2.2:4444/api/v1" or similar
    // We need the root (origin) part.
    // Assuming structure: http://host:port/api/v1
    
    // Quick parse:
    const baseUrl = API_CONSTANTS.BASE_URL.replace('/api/v1', '');
    
    // Ensure path starts with / if not present
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${cleanPath}`;
};
