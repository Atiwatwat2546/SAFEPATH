import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import colors from '../theme/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiFetch } from '../services/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface InfoItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const ProfileInfo: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [infoItems, setInfoItems] = useState<InfoItem[] | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (!res.ok) {
          console.log('[PROFILE_INFO_LOAD_ERROR]', res.status);
          setInfoItems([]);
          return;
        }
        const data = await res.json();
        const items: InfoItem[] = [
          { icon: 'mail', label: 'อีเมล', value: data.email || '-' },
          { icon: 'call', label: 'เบอร์โทรศัพท์', value: data.phone || '-' },
          { icon: 'calendar', label: 'วันเกิด', value: data.birthDate || '-' },
          { icon: 'person', label: 'เพศ', value: data.gender || '-' },
          { icon: 'location', label: 'ที่อยู่', value: data.address || '-' },
        ];
        setInfoItems(items);
      } catch (e) {
        console.log('[PROFILE_INFO_LOAD_EXCEPTION]', e);
        setInfoItems([]);
      }
    };

    load();
  }, []);

  return (
    <View style={styles.container}>
      {infoItems === null ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        infoItems.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.infoRow,
              index !== infoItems.length - 1 && styles.borderBottom,
            ]}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="pencil" size={16} color={colors.primary} />
        <Text style={styles.editButtonText}>แก้ไขข้อมูลส่วนตัว</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 24,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default ProfileInfo;
