import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../components/ui/button';
import colors from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItem {
  icon: string;
  label: string;
  onPress?: () => void;
}

interface SettingGroup {
  title: string;
  items: SettingItem[];
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const settingGroups: SettingGroup[] = [
    {
      title: 'บัญชี',
      items: [
        { icon: '👤', label: 'ข้อมูลส่วนตัว' },
        { icon: '🔔', label: 'การแจ้งเตือน' },
        { icon: '🔒', label: 'ความเป็นส่วนตัว' },
      ],
    },
    {
      title: 'บัญชี',
      items: [
        { icon: '📄', label: 'ข้อมูลส่วนตัว' },
        { icon: '🔒', label: 'ความเป็นส่วนตัว' },
      ],
    },
    {
      title: 'บัญชี',
      items: [
        { icon: '🌐', label: 'ภาษา' },
        { icon: '💬', label: 'ศูนย์ช่วยเหลือ' },
        { icon: '📑', label: 'เงื่อนไขการใช้งาน' },
        { icon: '⚪', label: 'นโยบายความเป็นส่วนตัว' },
      ],
    },
  ];

  const handleLogout = () => {
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>การตั้งค่า</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
              >
                <View style={styles.settingIconContainer}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.settingLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>แพลตฟอร์มบริการรับ-ส่งผู้ป่วย</Text>
          <Text style={styles.versionText}>เวอร์ชัน 1.0.0</Text>
        </View>

        <View style={styles.logoutContainer}>
          <Button variant="destructive" onPress={handleLogout} style={styles.logoutButton}>
            ออกจากระบบ
          </Button>
        </View>
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
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  group: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  settingIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.foreground,
  },
  versionContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  versionText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  logoutContainer: {
    marginBottom: 100,
  },
  logoutButton: {
    height: 48,
  },
});

export default SettingsScreen;
