import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import colors from '../theme/colors';
import { setPendingProfile } from '../services/signupStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    username: '',
    idCard: '',
    phone: '',
  });

  const handleSubmit = () => {
    // เก็บข้อมูลพื้นฐานไว้ชั่วคราว เพื่อนำไปอัปเดตโปรไฟล์หลังจากสมัคร/ล็อกอินสำเร็จ
    setPendingProfile({
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
    });
    navigation.navigate('SignUp2');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สร้างบัญชี</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>โปรดกรอกข้อมูลเพื่อสร้างบัญชี</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="อีเมล"
              placeholder="กรอกอีเมลของคุณ"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="ชื่อ-นามสกุล"
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Input
              label="ชื่อผู้ใช้"
              placeholder="กรอกชื่อผู้ใช้ของคุณ"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
            />

            <Input
              label="เลขบัตรประชาชน"
              placeholder="กรอกเลขบัตรประชาชนของคุณ"
              value={formData.idCard}
              onChangeText={(text) => setFormData({ ...formData, idCard: text })}
              keyboardType="numeric"
            />

            <Input
              label="เบอร์โทร"
              placeholder="+66 123 456 789"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />

            <Text style={styles.disclaimer}>
              ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย
            </Text>

            <Button onPress={handleSubmit} style={styles.submitButton}>
              ต่อไป
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    fontFamily: 'Prompt_600SemiBold',

    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Prompt_700Bold',

    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  form: {
    gap: 8,
  },
  disclaimer: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 14,
    color: colors.gray600,
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
  },
});

export default SignUpScreen;
