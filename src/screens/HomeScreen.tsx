import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import WaveHeader from '../components/WaveHeader';
import BookingCard from '../components/BookingCard';
import UpcomingBooking from '../components/UpcomingBooking';
import StatCards from '../components/StatCards';
import colors from '../theme/colors';
import { auth, db } from '../firebase';
import { getAuthToken } from '../services/authStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeUser {
  name?: string;
  username: string;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<HomeUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('[HOME_USER_NOT_LOGGED_IN]');
          setUser(null);
          setLoadingUser(false);
          return;
        }

        // ดึงข้อมูลผู้ใช้จาก Firestore
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setUser({ 
            name: userData?.name || '', 
            username: userData?.username || userData?.email || '' 
          });
        } else {
          console.log('[HOME_USER_DOC_NOT_FOUND]');
          setUser(null);
        }
      } catch (e) {
        console.log('[HOME_USER_LOAD_EXCEPTION]', e);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    const loadNotifications = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const notificationsSnapshot = await db.collection('notifications')
          .where('userId', '==', currentUser.uid)
          .get();
        
        const unread = notificationsSnapshot.docs.filter(
          doc => !doc.data().read
        ).length;
        setUnreadCount(unread);
      } catch (e) {
        console.log('[HOME_NOTIFICATIONS_LOAD_EXCEPTION]', e);
      }
    };

    loadUser();
    loadNotifications();
  }, []);

  const displayName = user?.name || user?.username || 'ผู้ใช้ใหม่';
  const avatarUri = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face';

  return (
    <View style={styles.container}>
      <WaveHeader height={180}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Profile' } as any)}>
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              </TouchableOpacity>
              <View style={styles.greeting}>
                <Text style={styles.greetingText}>สวัสดี</Text>
                {loadingUser ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.userName}>{displayName}!</Text>
                )}
                <Text style={styles.welcomeBack}>ยินดีต้อนรับกลับมา</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications" size={20} color={colors.white} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </WaveHeader>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <BookingCard />
        <UpcomingBooking />
        <StatCards />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  greeting: {
    gap: 2,
  },
  greetingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  welcomeBack: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    marginTop: -24,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});

export default HomeScreen;
