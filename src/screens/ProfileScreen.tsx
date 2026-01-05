import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WaveHeader from '../components/WaveHeader';
import ProfileInfo from '../components/ProfileInfo';
import colors from '../theme/colors';
import { apiFetch } from '../services/api';

interface ProfileData {
  name?: string;
  username: string;
}

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (!res.ok) {
          console.log('[PROFILE_LOAD_ERROR]', res.status);
          setProfile(null);
          return;
        }
        const data = await res.json();
        setProfile({ name: data.name, username: data.username });
      } catch (e) {
        console.log('[PROFILE_LOAD_EXCEPTION]', e);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const displayName = profile?.name || profile?.username || 'ผู้ใช้ใหม่';
  const avatarUri = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face';

  return (
    <View style={styles.container}>
      <WaveHeader height={210}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>
        </SafeAreaView>
      </WaveHeader>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.nameContainer}>
          <View style={styles.nameBadge}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.name}>{displayName}</Text>
            )}
          </View>
        </View>

        <ProfileInfo />
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
    alignItems: 'center',
    paddingTop: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    marginTop: -24,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  nameBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default ProfileScreen;
