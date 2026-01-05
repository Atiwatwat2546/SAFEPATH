import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../components/ui/button';
import { serviceHistory } from '../data/mockData';
import colors from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'BookingDetail'>;

const BookingDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { id } = route.params;

  const booking = serviceHistory.find((b) => b.id === id);

  if (!booking) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>ไม่พบข้อมูลการจอง</Text>
      </View>
    );
  }

  const statusText: Record<string, string> = {
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก',
    pending: 'รอดำเนินการ',
  };

  const statusColor: Record<string, string> = {
    completed: colors.primary,
    cancelled: colors.destructive,
    pending: colors.accent,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดการจอง</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* สถานะการจอง */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>สถานะการจอง</Text>
            <Text style={[styles.status, { color: statusColor[booking.status] }]}>
              {statusText[booking.status]}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <View>
              <Text style={styles.infoLabel}>วันที่และเวลา</Text>
              <Text style={styles.infoValue}>
                {booking.date} {booking.time}
              </Text>
            </View>
          </View>
        </View>

        {/* ข้อมูลเส้นทาง */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลเส้นทาง</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={styles.routeLine} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.infoLabel}>ต้นทาง</Text>
              <Text style={styles.infoValue}>{booking.from}</Text>
            </View>
          </View>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.destructive }]} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.infoLabel}>ปลายทาง</Text>
              <Text style={styles.infoValue}>{booking.to}</Text>
            </View>
          </View>
        </View>

        {/* ข้อมูลผู้ดูแล */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลผู้ดูแล</Text>
          <View style={styles.caregiverContainer}>
            <View style={styles.caregiverAvatar}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.caregiverInfo}>
              <Text style={styles.caregiverName}>{booking.caregiver}</Text>
              {booking.status === 'completed' && booking.rating > 0 && (
                <View style={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={16}
                      color={i < booking.rating ? colors.accent : colors.mutedForeground}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
          <Button variant="outline" style={styles.contactButton}>
            <View style={styles.contactButtonContent}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.contactButtonText}>ติดต่อผู้ดูแล</Text>
            </View>
          </Button>
        </View>

        {/* ข้อมูลค่าใช้จ่าย */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ข้อมูลค่าใช้จ่าย</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>ค่าบริการ</Text>
            <Text style={styles.priceValue}>฿{booking.price}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>ค่าธรรมเนียม</Text>
            <Text style={styles.priceValue}>฿0</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>รวมทั้งหมด</Text>
            <Text style={styles.totalValue}>฿{booking.price}</Text>
          </View>
        </View>

        {booking.status === 'completed' && (
          <View style={styles.rebookContainer}>
            <Button style={styles.rebookButton}>จองอีกครั้ง</Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  routePoint: {
    alignItems: 'center',
    marginRight: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    height: 48,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  routeInfo: {
    flex: 1,
  },
  caregiverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  caregiverAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caregiverInfo: {
    flex: 1,
  },
  caregiverName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  contactButton: {
    borderColor: colors.primary,
  },
  contactButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactButtonText: {
    color: colors.primary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
  rebookContainer: {
    marginBottom: 100,
  },
  rebookButton: {
    height: 48,
  },
});

export default BookingDetailScreen;
