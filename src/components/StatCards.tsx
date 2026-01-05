import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StatCards: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [serviceCount, setServiceCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('[STATS_USER_NOT_LOGGED_IN]');
          return;
        }

        const bookingsSnapshot = await db.collection('bookings')
          .where('userId', '==', currentUser.uid)
          .get();
        
        const all = bookingsSnapshot.docs.map(doc => doc.data());
        const completed = all.filter((b: any) => b.status === 'completed');
        setServiceCount(completed.length);
        setTripCount(all.length);
        setRating(0);
      } catch (e) {
        console.log('[STATS_LOAD_EXCEPTION]', e);
      }
    };

    loadStats();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.statNumber}>{serviceCount}</Text>
        <Text style={styles.statLabel}>ประวัติการใช้บริการ</Text>
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' } as any)}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="settings" size={24} color={colors.primary} />
        </View>
        <Text style={styles.statLabel}>ตั้งค่า</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('BookingHistory')}
      >
        <Text style={styles.statNumber}>{tripCount}</Text>
        <Text style={styles.statLabel}>การเดินทางทั้งหมด</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={20} color={colors.accent} />
          <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.statLabel}>คะแนนเฉลี่ย</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  card: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontFamily: 'Prompt_700Bold',

    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
    textAlign: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontFamily: 'Prompt_700Bold',

    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
});

export default StatCards;
