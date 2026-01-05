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
import { setAuthToken } from '../services/authStore';
import { apiFetch } from '../services/api';
import { clearPendingProfile, getPendingProfile } from '../services/signupStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  const baseURL = 'http://192.168.1.13:4001';

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('รหัสผ่านไม่ตรงกัน', 'โปรดยืนยันรหัสผ่านให้ตรงกัน');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      console.log('[LOGIN_SUBMIT]', {
        username: formData.username,
        time: new Date().toISOString(),
      });

      // ลองล็อกอินก่อน
      const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        setAuthToken(loginData.token);
        const pending = getPendingProfile();
        if (pending) {
          try {
            const res = await apiFetch('/api/users/me', {
              method: 'PUT',
              body: JSON.stringify(pending),
            });
            if (!res.ok) {
              console.log('[LOGIN_PROFILE_UPDATE_ERROR]', res.status);
            }
          } catch (e) {
            console.log('[LOGIN_PROFILE_UPDATE_EXCEPTION]', e);
          } finally {
            clearPendingProfile();
          }
        }
        console.log('[LOGIN_SUCCESS]', {
          username: formData.username,
          userId: loginData.user?.id,
          time: new Date().toISOString(),
        });
        navigation.navigate('MainTabs');
        return;
      }

      // ถ้าล็อกอินไม่ได้ (เช่น user ยังไม่มี) ให้ลองสมัครใหม่
      if (loginResponse.status === 401) {
        console.log('[LOGIN_FAILED_TRY_REGISTER]', {
          username: formData.username,
          status: loginResponse.status,
          time: new Date().toISOString(),
        });

        const registerResponse = await fetch(`${baseURL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            // ฟิลด์อื่น ๆ ไว้ค่อยเชื่อมกับ SignUp screens ภายหลัง
          }),
        });

        if (!registerResponse.ok) {
          const text = await registerResponse.text();
          console.log('[REGISTER_ERROR]', {
            username: formData.username,
            status: registerResponse.status,
            body: text,
            time: new Date().toISOString(),
          });
          Alert.alert('ไม่สามารถสร้างบัญชีได้', 'โปรดลองใหม่อีกครั้ง');
          return;
        }
        const registerData = await registerResponse.json();
        setAuthToken(registerData.token);
        const pending = getPendingProfile();
        if (pending) {
          try {
            const res = await apiFetch('/api/users/me', {
              method: 'PUT',
              body: JSON.stringify(pending),
            });
            if (!res.ok) {
              console.log('[REGISTER_PROFILE_UPDATE_ERROR]', res.status);
            }
          } catch (e) {
            console.log('[REGISTER_PROFILE_UPDATE_EXCEPTION]', e);
          } finally {
            clearPendingProfile();
          }
        }
        console.log('[REGISTER_SUCCESS]', {
          username: formData.username,
          userId: registerData.user?.id,
          time: new Date().toISOString(),
        });

        navigation.navigate('MainTabs');
        return;
      }

      const errorText = await loginResponse.text();
      console.log('[LOGIN_ERROR_UNEXPECTED]', {
        username: formData.username,
        status: loginResponse.status,
        body: errorText,
        time: new Date().toISOString(),
      });
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง');
    } catch (error) {
      console.log('[LOGIN_NETWORK_ERROR]', {
        username: formData.username,
        error,
        time: new Date().toISOString(),
      });
      Alert.alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'กรุณาตรวจสอบว่า backend รันอยู่ที่พอร์ต 4001');
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
            <Text style={styles.title}>เข้าสู่ระบบบัญชีของคุณ</Text>
            <Text style={styles.subtitle}>กรอกข้อมูลเพื่อเข้าสู่ระบบ</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="ชื่อผู้ใช้"
              placeholder="กรอกชื่อผู้ใช้ของคุณ"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
            />

            <Input
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            <Input
              label="ยืนยันรหัสผ่าน"
              placeholder="ยืนยันรหัสผ่านของคุณ"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน</Text>
            </TouchableOpacity>

            <Button onPress={handleSubmit} style={styles.submitButton} loading={loading} disabled={loading}>
              เข้าสู่ระบบ
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>หรือ</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button variant="outline" style={styles.googleButton}>
              <View style={styles.googleButtonContent}>
                <Ionicons name="logo-google" size={20} color={colors.foreground} />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
            </Button>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>ลงทะเบียน</Text>
              </TouchableOpacity>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray300,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: colors.gray500,
    fontSize: 14,
  },
  googleButton: {
    borderRadius: 8,
    borderColor: colors.gray300,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleButtonText: {
    fontSize: 16,
    color: colors.gray700,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  signupText: {
    fontSize: 14,
    color: colors.gray600,
  },
  signupLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
