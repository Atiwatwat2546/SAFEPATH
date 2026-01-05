import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { auth, db } from '../firebase';

interface Upcoming {
  id: string;
  date: string;
  time: string;
  from: string;
  to: string;
  status: string;
}

const UpcomingBooking: React.FC = () => {
  const [upcoming, setUpcoming] = useState<Upcoming | null>(null);

  useEffect(() => {
    const loadUpcoming = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('[UPCOMING_USER_NOT_LOGGED_IN]');
          setUpcoming(null);
          return;
        }

        const bookingsSnapshot = await db.collection('bookings')
          .where('userId', '==', currentUser.uid)
          .where('status', '==', 'pending')
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();
        
        if (bookingsSnapshot.empty) {
          setUpcoming(null);
          return;
        }

        const doc = bookingsSnapshot.docs[0];
        const b = doc.data();
        setUpcoming({
          id: doc.id,
          date: b.date,
          time: b.time,
          from: b.fromAddress,
          to: b.toAddress,
          status: b.status,
        });
      } catch (e) {
        console.log('[UPCOMING_LOAD_EXCEPTION]', e);
        setUpcoming(null);
      }
    };

    loadUpcoming();
  }, []);

  if (!upcoming) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>การจองที่กำลังจะมาถึง</Text>
        <Text style={styles.emptyText}>ยังไม่มีการจองที่กำลังจะมาถึง</Text>
      </View>
    );
  }

  const handleCardPress = () => {
    Alert.alert(
      'รายละเอียดการจอง',
      `วันที่: ${upcoming.date}\nเวลา: ${upcoming.time}\n\nจาก: ${upcoming.from}\n\nถึง: ${upcoming.to}\n\nสถานะ: รอยืนยัน\n\nคนขับ: กำลังจัดหาคนขับให้คุณ...`,
      [{ text: 'ตกลง' }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>การจองที่กำลังจะมาถึง</Text>
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={handleCardPress}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={20} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.dateTime}>
              {upcoming.date} | {upcoming.time}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.mutedForeground} />
              <Text style={styles.locationText}>จาก: {upcoming.from}</Text>
            </View>
            <Text style={styles.locationSubText}>ถึง: {upcoming.to}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </View>
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>รอยืนยัน</Text>
          </View>
          <Text style={styles.tapHint}>แตะเพื่อดูรายละเอียด</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  emptyText: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 14,
    color: colors.mutedForeground,
  },
  sectionTitle: {
    fontFamily: 'Prompt_700Bold',

    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  dateTime: {
    fontFamily: 'Prompt_600SemiBold',

    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 14,
    color: colors.mutedForeground,
  },
  locationSubText: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 14,
    color: colors.mutedForeground,
    marginLeft: 20,
  },
  footer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Prompt_500Medium',

    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  tapHint: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 12,
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },
});

export default UpcomingBooking;
