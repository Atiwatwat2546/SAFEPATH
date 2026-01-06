import React, { useState, useEffect } from 'react';
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
import { auth } from '../firebase';
import {
  isBiometricSupported,
  isBiometricEnrolled,
  isBiometricEnabled,
  authenticateWithBiometric,
  enableBiometric,
  getBiometricType,
} from '../services/biometricAuth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
} catch (e) {
  console.log('[GOOGLE_SIGNIN] Native module not available in Expo Go');
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [biometricLoading, setBiometricLoading] = useState(false);

  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
          offlineAccess: true,
        });
        setGoogleAvailable(true);
      } catch (e) {
        console.log('[GOOGLE_SIGNIN_CONFIG] Error:', e);
        setGoogleAvailable(false);
      }
    }
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const supported = await isBiometricSupported();
    const enrolled = await isBiometricEnrolled();
    const enabled = await isBiometricEnabled();
    
    if (supported && enrolled && enabled) {
      setBiometricAvailable(true);
      const type = await getBiometricType();
      setBiometricType(type);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      console.log('[FIREBASE_LOGIN_SUBMIT]', {
        email: formData.email,
        time: new Date().toISOString(),
      });

      // เข้าสู่ระบบด้วย Firebase Authentication
      const userCredential = await auth.signInWithEmailAndPassword(formData.email, formData.password);
      const user = userCredential.user;

      // เก็บ UID เป็น session token
      setAuthToken(user!.uid);

      console.log('[FIREBASE_LOGIN_SUCCESS]', {
        email: formData.email,
        uid: user!.uid,
        time: new Date().toISOString(),
      });

      // ตรวจสอบว่ารองรับ biometric และยังไม่ได้เปิดใช้งาน
      const supported = await isBiometricSupported();
      const enrolled = await isBiometricEnrolled();
      const enabled = await isBiometricEnabled();

      if (supported && enrolled && !enabled) {
        const biometricType = await getBiometricType();
        
        Alert.alert(
          `เปิดใช้งาน ${biometricType}?`,
          `คุณต้องการเข้าสู่ระบบด้วย ${biometricType} ในครั้งถัดไปหรือไม่?`,
          [
            {
              text: 'ไม่ใช้',
              style: 'cancel',
              onPress: () => navigation.navigate('MainTabs'),
            },
            {
              text: 'เปิดใช้งาน',
              onPress: async () => {
                const success = await enableBiometric(formData.email, user!.uid);
                if (success) {
                  Alert.alert('สำเร็จ', `เปิดใช้งาน ${biometricType} แล้ว`);
                }
                navigation.navigate('MainTabs');
              },
            },
          ]
        );
      } else {
        navigation.navigate('MainTabs');
      }
    } catch (error: any) {
      console.log('[FIREBASE_LOGIN_ERROR]', {
        email: formData.email,
        error: error.code,
        time: new Date().toISOString(),
      });

      let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง\nกรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'บัญชีนี้ถูกระงับการใช้งาน';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่';
      }

      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (biometricLoading) return;

    try {
      setBiometricLoading(true);

      console.log('[BIOMETRIC_LOGIN_START]', {
        time: new Date().toISOString(),
      });

      const result = await authenticateWithBiometric();

      if (result.success && result.uid) {
        // เข้าสู่ระบบด้วย UID ที่บันทึกไว้
        setAuthToken(result.uid);

        console.log('[BIOMETRIC_LOGIN_SUCCESS]', {
          email: result.email,
          uid: result.uid,
          time: new Date().toISOString(),
        });

        navigation.navigate('MainTabs');
      } else {
        console.log('[BIOMETRIC_LOGIN_CANCELLED]');
      }
    } catch (error: any) {
      console.log('[BIOMETRIC_LOGIN_ERROR]', error);
      
      // ถ้า biometric ล้มเหลว ให้ผู้ใช้ login ด้วย email/password แทน
      Alert.alert(
        'ไม่สามารถเข้าสู่ระบบได้',
        'กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน',
        [{ text: 'ตกลง' }]
      );
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GoogleSignin || !googleAvailable) {
      Alert.alert(
        'Google Sign-In ไม่พร้อมใช้งาน',
        'Google Sign-In ต้องใช้งานผ่าน Development Build หรือ Production Build\n\nใน Expo Go ไม่สามารถใช้งานได้\n\nกรุณาใช้การเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านแทน'
      );
      return;
    }

    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const response = await fetch(`${baseURL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: userInfo.idToken,
          email: userInfo.user.email,
          name: userInfo.user.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
      }
    } catch (error: any) {
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google sign in');
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        console.log('Google sign in already in progress');
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('ข้อผิดพลาด', 'Google Play Services ไม่พร้อมใช้งาน');
      } else {
        console.log('Google sign in error:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.prompt(
      'ลืมรหัสผ่าน',
      'กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ส่ง',
          onPress: async (email: string) => {
            if (!email) {
              Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมล');
              return;
            }
            try {
              await auth.sendPasswordResetEmail(email);
              Alert.alert('สำเร็จ', 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
            } catch (error: any) {
              if (error.code === 'auth/user-not-found') {
                Alert.alert('ข้อผิดพลาด', 'ไม่พบอีเมลนี้ในระบบ');
              } else {
                Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เข้าสู่ระบบ</Text>
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
              label="อีเมล"
              placeholder="กรอกอีเมลของคุณ"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่านของคุณ"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />

            {null}

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน</Text>
            </TouchableOpacity>

            <Button onPress={handleSubmit} style={styles.submitButton} loading={loading} disabled={loading}>
              เข้าสู่ระบบ
            </Button>

            {biometricAvailable && (
              <Button 
                variant="outline" 
                style={styles.biometricButton} 
                onPress={handleBiometricLogin} 
                loading={biometricLoading} 
                disabled={biometricLoading}
              >
                <View style={styles.biometricButtonContent}>
                  <Ionicons name="finger-print" size={24} color={colors.primary} />
                  <Text style={styles.biometricButtonText}>เข้าสู่ระบบด้วย {biometricType}</Text>
                </View>
              </Button>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>หรือ</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button variant="outline" style={styles.googleButton} onPress={handleGoogleSignIn} loading={googleLoading} disabled={googleLoading}>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray800,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Prompt_400Regular',
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
    fontFamily: 'Prompt_400Regular',
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
    fontFamily: 'Prompt_400Regular',
    paddingHorizontal: 16,
    color: colors.gray500,
    fontSize: 14,
  },
  biometricButton: {
    marginTop: 12,
    borderRadius: 8,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  biometricButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  biometricButtonText: {
    fontFamily: 'Prompt_500Medium',
    fontSize: 16,
    color: colors.primary,
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
    fontFamily: 'Prompt_400Regular',
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
    fontFamily: 'Prompt_400Regular',
    fontSize: 14,
    color: colors.gray600,
  },
  signupLink: {
    fontFamily: 'Prompt_500Medium',
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default LoginScreen;
