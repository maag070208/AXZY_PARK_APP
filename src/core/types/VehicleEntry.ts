export interface VehicleEntry {
    id: number;
    userId: number;
    locationId?: number;
    brand: string;
    model: string;
    color: string;
    entryNumber: string;
    plates: string;
    mileage?: number;
    notes?: string;
    status: string;
    entryDate: string;
    photos?: { id: number; category: string; imageUrl: string; description?: string; }[];
    assignments?: { 
        id: number; 
        status: string; 
        type: string; 
        createdAt: string;
        operator?: { name: string; lastName: string };
        targetLocation?: { name: string };
        targetLocationId?: number;
    }[];
    location?: {
        id: number;
        name: string;
        aisle: string;
        spot: string;
    };
    user?: {
        id: number;
        name: string;
        lastName: string;
    };
    extraCosts?: {
        id: number;
        reason: string;
        amount: number;
        imageUrl?: string;
        createdAt: string;
        operator?: { name: string; lastName: string; };
    }[];
    movements?: {
        id: number;
        toLocationId: number;
        fromLocation?: { id: number; name: string; aisle: string; spot: string; };
        toLocation?: { id: number; name: string; aisle: string; spot: string; };
        createdAt: string;
    }[];
}
