import React from 'react';
import { View } from 'react-native';

/**
 * For now, just a redirect wrapper or we can show specific exit info.
 * Ideally, we should reuse EntryDetailScreen but in a "ReadOnly / Exited" mode.
 * But since specific Exit data is stored in VehicleExit, maybe show that first.
 * Let's keep it simple: List -> Entry Detail.
 * 
 * Wait, `ExitDetailScreen` was planned. Let's make it show the Exit Receipt.
 */

import { Text } from 'react-native-paper';

export const ExitDetailScreen = () => {
    // Placeholder - we might just navigate to EntryDetailScreen with status EXITED
    // For now let's just show text
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Detalle de Salida (En Construcción)</Text>
        </View>
    );
};
