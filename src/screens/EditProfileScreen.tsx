import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { userData } from '../data/mockData';
import colors from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    birthDate: userData.birthDate,
    gender: userData.gender,
    address: userData.address,
  });

  const handleSave = () => {
    Toast.show({
      type: 'success',
      text1: 'บันทึกสำเร็จ',
      text2: 'ข้อมูลส่วนตัวของคุณได้รับการอัปเดตแล้ว',
    });
    setTimeout(() => {
      navigation.goBack();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขข้อมูลส่วนตัว</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraEmoji}>📷</Text>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="ชื่อ-นามสกุล"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Input
                label="อีเมล"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
              />

              <Input
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />

              <Input
                label="วันเกิด"
                value={formData.birthDate}
                onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
              />

              <View style={styles.selectContainer}>
                <Text style={styles.label}>เพศ</Text>
                <View style={styles.select}>
                  <Text style={styles.selectText}>{formData.gender}</Text>
                  <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
                </View>
              </View>

              <View style={styles.textareaContainer}>
                <Text style={styles.label}>ที่อยู่</Text>
                <TextInput
                  style={styles.textarea}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                variant="outline"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                ยกเลิก
              </Button>
              <Button onPress={handleSave} style={styles.saveButton}>
                <View style={styles.saveButtonContent}>
                  <Ionicons name="save" size={16} color={colors.white} />
                  <Text style={styles.saveButtonText}>บันทึก</Text>
                </View>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: `${colors.primary}4D`,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 20,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraEmoji: {
    fontSize: 16,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 8,
  },
  form: {
    gap: 8,
  },
  selectContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  select: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  selectText: {
    fontSize: 16,
    color: colors.foreground,
  },
  textareaContainer: {
    marginBottom: 16,
  },
  textarea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
