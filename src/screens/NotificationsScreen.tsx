import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiFetch } from '../services/api';
import colors from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/notifications');
      if (!res.ok) {
        console.log('[NOTIFICATIONS_LOAD_ERROR]', res.status);
        setNotifications([]);
        return;
      }
      const data = await res.json();
      setNotifications(data);
    } catch (e) {
      console.log('[NOTIFICATIONS_LOAD_EXCEPTION]', e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const res = await apiFetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
      }
    } catch (e) {
      console.log('[MARK_ALL_READ_ERROR]', e);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'promo':
        return '🎉';
      default:
        return '🔔';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            <Text style={styles.markAllText}>อ่านทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            คุณมี {unreadCount} การแจ้งเตือนที่ยังไม่ได้อ่าน
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลดการแจ้งเตือน...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
          <View
            style={[
              styles.notificationCard,
              !item.read && styles.notificationCardUnread,
            ]}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationIcon}>
                {getNotificationIcon(item.type)}
              </Text>
              <View style={styles.notificationText}>
                <View style={styles.notificationHeader}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !item.read && styles.notificationTitleUnread,
                    ]}
                  >
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage}>{item.message}</Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>ไม่มีการแจ้งเตือน</Text>
          </View>
        }
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.card,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  unreadBanner: {
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  unreadText: {
    fontSize: 14,
    color: colors.primary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationText: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  notificationTitleUnread: {
    color: colors.foreground,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 12,
  },
});

export default NotificationsScreen;
