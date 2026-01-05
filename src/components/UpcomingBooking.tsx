import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { upcomingBooking } from '../data/mockData';
import colors from '../theme/colors';

const UpcomingBooking: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>การจองที่กำลังจะมาถึง</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={20} color={colors.primary} />
          </View>
          <View style={styles.content}>
            <Text style={styles.dateTime}>
              {upcomingBooking.date} | {upcomingBooking.time}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.mutedForeground} />
              <Text style={styles.locationText}>จาก: {upcomingBooking.from}</Text>
            </View>
            <Text style={styles.locationSubText}>ถึง: {upcomingBooking.to}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ยืนยันแล้ว</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
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
    fontSize: 14,
    color: colors.mutedForeground,
  },
  locationSubText: {
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
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default UpcomingBooking;
