import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import colors from '../theme/colors';
import { getPendingProfile, clearPendingProfile } from '../services/signupStore';
import { setAuthToken } from '../services/authStore';
import { auth, db } from '../firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignUp4Screen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกรหัสผ่านและยืนยันรหัสผ่าน');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'โปรดยืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    if (password.length < 6) {
      Alert.alert('รหัสผ่านสั้นเกินไป', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    const pending = getPendingProfile();
    if (!pending || !pending.email) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลการสมัคร กรุณาเริ่มใหม่');
      navigation.navigate('SignUp');
      return;
    }

    try {
      setLoading(true);

      // สร้างบัญชีด้วย Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(pending.email, password);
      const user = userCredential.user;

      // บันทึกข้อมูลผู้ใช้ลง Firestore
      await db.collection('users').doc(user!.uid).set({
        email: pending.email,
        name: pending.name || '',
        phone: pending.phone || '',
        username: pending.username || '',
        idCard: pending.idCard || '',
        birthDate: pending.birthDate || '',
        gender: pending.gender || '',
        occupation: pending.occupation || '',
        address: pending.address || '',
        createdAt: new Date().toISOString(),
      });

      // เก็บ UID เป็น token สำหรับ session
      setAuthToken(user!.uid);

      clearPendingProfile();
      Alert.alert('สำเร็จ', 'สร้างบัญชีเรียบร้อยแล้ว', [
        {
          text: 'ตรวจสอบ',
          onPress: () => navigation.navigate('MainTabs'),
        },
      ]);
    } catch (error: any) {
      console.log('[FIREBASE_SIGNUP_ERROR]', error);
      let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านไม่ปลอดภัยเพียงพอ';
      }
      
      Alert.alert('ไม่สามารถสร้างบัญชีได้', errorMessage);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>ตั้งรหัสผ่านของคุณ</Text>
            <Text style={styles.subtitle}>กรุณาตั้งรหัสผ่านเพื่อความปลอดภัย</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่านของคุณ (อย่างน้อย 6 ตัวอักษร)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="ยืนยันรหัสผ่าน"
              placeholder="ยืนยันรหัสผ่านของคุณ"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Text style={styles.disclaimer}>
              รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร
            </Text>

            <Button onPress={handleSubmit} style={styles.submitButton} loading={loading} disabled={loading}>
              สร้างบัญชี
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray500,
  },
  form: {
    gap: 8,
  },
  disclaimer: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
  },
});

export default SignUp4Screen;
