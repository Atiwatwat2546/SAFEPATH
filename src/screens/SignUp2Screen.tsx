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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import colors from '../theme/colors';
import { getPendingProfile, setPendingProfile } from '../services/signupStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignUp2Screen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'male',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    const current = getPendingProfile() || {};
    setPendingProfile({
      ...current,
      birthDate: formData.birthDate,
      gender: formData.gender,
    });
    navigation.navigate('SignUp3');
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

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={48} color={colors.gray400} />
              )}
            </View>
            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="ชื่อจริง"
              placeholder="กรอกชื่อจริงของคุณ"
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />

            <Input
              label="นามสกุล"
              placeholder="กรอกนามสกุลของคุณ"
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />

            <Input
              label="วัน/เดือน/ปีเกิด"
              placeholder="MM/DD/YYYY"
              value={formData.birthDate}
              onChangeText={(text) => setFormData({ ...formData, birthDate: text })}
            />

            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>เพศ</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === 'male' && styles.genderOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'male' })}
                >
                  <View
                    style={[
                      styles.radio,
                      formData.gender === 'male' && styles.radioSelected,
                    ]}
                  >
                    {formData.gender === 'male' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.genderText}>ชาย</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    formData.gender === 'female' && styles.genderOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, gender: 'female' })}
                >
                  <View
                    style={[
                      styles.radio,
                      formData.gender === 'female' && styles.radioSelected,
                    ]}
                  >
                    {formData.gender === 'female' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.genderText}>หญิง</Text>
                </TouchableOpacity>
              </View>
            </View>

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
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Prompt_700Bold',

    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 8,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontFamily: 'Prompt_500Medium',

    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 24,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genderOptionSelected: {},
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  genderText: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 16,
    color: colors.foreground,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default SignUp2Screen;
