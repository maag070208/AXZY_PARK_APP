import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppSelector } from '../../../core/store/hooks';
import { useAppNavigation } from '../../../navigation/hooks/useAppNavigation';
import ModernStyles from '../../../shared/theme/app.styles';
import { EntrySummaryCard } from '../components/EntrySummaryCard';
import { ExitsSummaryCard } from '../components/ExitsSummaryCard';
import { KeyAssignmentsSummaryCard } from '../components/KeyAssignmentsSummaryCard';
import { LocationsSummaryCard } from '../components/LocationsSummaryCard';
import { MovementsSummaryCard } from '../components/MovementsSummaryCard';
import ReportsSummaryCard from '../components/ReportsSummaryCard';
import UsersSummaryCard from '../components/UsersSummaryCard';

export const HomeScreen = () => {
  const { navigateToScreen } = useAppNavigation();
  const { role } = useAppSelector(state => state.userState);
  const isRestricted = role === 'USER';
  const isAdmin = role === 'ADMIN';

  return (
    <View style={[ModernStyles.screenContainer, styles.container]}>
      {/* Header Personalizado */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
       
        <EntrySummaryCard 
          onPress={() => navigateToScreen('ENTRIES_STACK', 'ENTRIES_MAIN')} 
        />
        
        {/* Only show other cards if NOT restricted */}
        {!isRestricted && (
            <>
                <ExitsSummaryCard 
                onPress={() => navigateToScreen('EXITS_STACK', 'EXITS_MAIN')} 
                />
                <LocationsSummaryCard 
                onPress={() => navigateToScreen('LOCATIONS_STACK', 'LOCATIONS_MAIN')} 
                />
            </>
        )}

        {isAdmin && (
            <>
                <KeyAssignmentsSummaryCard 
                onPress={() => navigateToScreen('KEY_ASSIGNMENTS_STACK', 'KEY_ASSIGNMENTS_MAIN')} 
                />
                <MovementsSummaryCard 
                onPress={() => navigateToScreen('MOVEMENTS_STACK', 'MOVEMENTS_MAIN')} 
                />
                <UsersSummaryCard 
                onPress={() => navigateToScreen('USERS_STACK', 'USERS_MAIN')} 
                />
                <ReportsSummaryCard 
                onPress={() => navigateToScreen('REPORTS_STACK', 'REPORTS_MAIN')} 
                />
            </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // Adjust for status bar
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...ModernStyles.shadowSm,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
    marginLeft: 4,
  },
  genericCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
});
