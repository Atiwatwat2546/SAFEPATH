import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import ServiceHistoryItem from '../components/ServiceHistoryItem';
import colors from '../theme/colors';
import { apiFetch } from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = 'all' | 'completed' | 'cancelled';

interface HistoryBooking {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  caregiver: string;
  price: number;
  status: string;
  rating: number;
}

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [history, setHistory] = useState<HistoryBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'completed', label: 'เสร็จสิ้น' },
    { key: 'cancelled', label: 'ยกเลิก' },
  ];

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/api/bookings');
        if (!res.ok) {
          console.log('[HISTORY_LOAD_ERROR]', res.status);
          setHistory([]);
          return;
        }
        const data = await res.json();

        const mapped: HistoryBooking[] = (data || []).map((b: any) => ({
          id: b.id,
          date: b.date,
          time: b.time,
          from: b.fromAddress,
          to: b.toAddress,
          caregiver: '',
          price: 0,
          status: b.status,
          rating: 0,
        }));

        setHistory(mapped);
      } catch (e) {
        console.log('[HISTORY_LOAD_EXCEPTION]', e);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredHistory = history.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' } as any)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ประวัติการใช้บริการ</Text>
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ServiceHistoryItem booking={item} index={index} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'กำลังโหลดประวัติการใช้บริการ...' : 'ไม่พบประวัติการใช้บริการ'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.card,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Prompt_700Bold',

    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.card,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontFamily: 'Prompt_500Medium',

    fontSize: 14,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  tabTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 14,
    color: colors.mutedForeground,
  },
});

export default HistoryScreen;
