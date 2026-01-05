import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import colors from '../theme/colors';
import { auth, db } from '../firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    idCard: '',
    birthDate: '',
    gender: '',
    occupation: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log('[EDIT_PROFILE_USER_NOT_LOGGED_IN]');
          Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
          navigation.navigate('Login');
          return;
        }

        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) {
          console.log('[EDIT_PROFILE_DOC_NOT_FOUND]');
          return;
        }

        const data = userDoc.data();
        setFormData({
          name: data?.name || '',
          username: data?.username || '',
          email: data?.email || currentUser.email || '',
          phone: data?.phone || '',
          idCard: data?.idCard || '',
          birthDate: data?.birthDate || '',
          gender: data?.gender || '',
          occupation: data?.occupation || '',
          address: data?.address || '',
        });
        
        // โหลดรูปโปรไฟล์
        if (data?.profileImage) {
          setProfileImage(data.profileImage);
        }
        
        // ตั้งค่าวันที่เริ่มต้นถ้ามีข้อมูล
        if (data?.birthDate) {
          const parts = data.birthDate.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]) - 543; // แปลงจาก พ.ศ. เป็น ค.ศ.
            setSelectedDate(new Date(year, month, day));
          }
        }
      } catch (e) {
        console.log('[EDIT_PROFILE_LOAD_EXCEPTION]', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      // แปลงเป็นรูปแบบ วัน/เดือน/ปี (พ.ศ.)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = (date.getFullYear() + 543).toString();
      const formattedDate = `${day}/${month}/${year}`;
      setFormData({ ...formData, birthDate: formattedDate });
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'เลือกรูปภาพ',
      'เลือกวิธีการเลือกรูปภาพ',
      [
        {
          text: 'ถ่ายรูป',
          onPress: () => takePhoto(),
        },
        {
          text: 'เลือกจากคลัง',
          onPress: () => selectFromGallery(),
        },
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ข้อผิดพลาด', 'ต้องอนุญาตให้เข้าถึงกล้อง');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('[CAMERA_ERROR]', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดกล้องได้');
    }
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ข้อผิดพลาด', 'ต้องอนุญาตให้เข้าถึงคลังภาพ');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('[GALLERY_ERROR]', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // อ่านไฟล์เป็น base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // บันทึก base64 ลง Firestore โดยตรง
        await db.collection('users').doc(currentUser.uid).update({
          profileImage: base64data,
          updatedAt: new Date().toISOString(),
        });
        
        setProfileImage(base64data);
        setUploadingImage(false);
        
        Toast.show({
          type: 'success',
          text1: 'อัปโหลดรูปภาพสำเร็จ',
          text2: 'รูปโปรไฟล์ของคุณได้รับการอัปเดตแล้ว',
        });
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.log('[UPLOAD_IMAGE_ERROR]', error);
      setUploadingImage(false);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปโหลดรูปภาพได้');
    }
  };

  const handleSave = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        Alert.alert('ข้อผิดพลาด', 'กรุณาเข้าสู่ระบบก่อน');
        return;
      }

      setLoading(true);

      // อัปเดตข้อมูลใน Firestore
      const updateData: any = {
        name: formData.name,
        username: formData.username,
        phone: formData.phone,
        idCard: formData.idCard,
        birthDate: formData.birthDate,
        gender: formData.gender,
        occupation: formData.occupation,
        address: formData.address,
        updatedAt: new Date().toISOString(),
      };
      
      // เพิ่มรูปโปรไฟล์ถ้ามี
      if (profileImage) {
        updateData.profileImage = profileImage;
      }
      
      await db.collection('users').doc(currentUser.uid).update(updateData);

      Toast.show({
        type: 'success',
        text1: 'บันทึกสำเร็จ',
        text2: 'ข้อมูลส่วนตัวของคุณได้รับการอัปเดตแล้ว',
      });
      
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (e) {
      console.log('[EDIT_PROFILE_SAVE_EXCEPTION]', e);
      Toast.show({
        type: 'error',
        text1: 'เกิดข้อผิดพลาด',
        text2: 'ไม่สามารถบันทึกข้อมูลได้',
      });
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
        <Text style={styles.headerTitle}>แก้ไขข้อมูลส่วนตัว</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickImage} disabled={uploadingImage}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={48} color={colors.mutedForeground} />
                  </View>
                )}
                {uploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color={colors.white} />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Ionicons name="camera" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>
                {uploadingImage ? 'กำลังอัปโหลด...' : 'แตะเพื่อเปลี่ยนรูปโปรไฟล์'}
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="ชื่อ-นามสกุล"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="กรอกชื่อ-นามสกุล"
              />

              <Input
                label="ชื่อผู้ใช้"
                value={formData.username}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
                placeholder="กรอกชื่อผู้ใช้"
              />

              <Input
                label="อีเมล"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                placeholder="กรอกอีเมล"
                editable={false}
              />

              <Input
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                placeholder="กรอกเบอร์โทรศัพท์"
              />

              <Input
                label="เลขบัตรประชาชน"
                value={formData.idCard}
                onChangeText={(text) => setFormData({ ...formData, idCard: text })}
                keyboardType="number-pad"
                placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                maxLength={13}
              />

              <View style={styles.selectContainer}>
                <Text style={styles.label}>วันเกิด</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.datePickerText}>
                    {formData.birthDate || 'เลือกวันเกิด'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  locale="th-TH"
                />
              )}

              <View style={styles.selectContainer}>
                <Text style={styles.label}>เพศ</Text>
                <View style={styles.genderButtons}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'ชาย' && styles.genderButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, gender: 'ชาย' })}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === 'ชาย' && styles.genderButtonTextActive,
                      ]}
                    >
                      ชาย
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'หญิง' && styles.genderButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, gender: 'หญิง' })}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === 'หญิง' && styles.genderButtonTextActive,
                      ]}
                    >
                      หญิง
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'ไม่ระบุ' && styles.genderButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, gender: 'ไม่ระบุ' })}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        formData.gender === 'ไม่ระบุ' && styles.genderButtonTextActive,
                      ]}
                    >
                      ไม่ระบุ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Input
                label="อาชีพ"
                value={formData.occupation}
                onChangeText={(text) => setFormData({ ...formData, occupation: text })}
                placeholder="กรอกอาชีพ"
              />

              <View style={styles.textareaContainer}>
                <Text style={styles.label}>ที่อยู่</Text>
                <TextInput
                  style={styles.textarea}
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholder="กรอกที่อยู่"
                  placeholderTextColor={colors.mutedForeground}
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
              <Button onPress={handleSave} style={styles.saveButton} disabled={loading}>
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
  avatarPlaceholder: {
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
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
    fontFamily: 'Prompt_400Regular',

    fontSize: 16,
  },
  avatarHint: {
    fontFamily: 'Prompt_400Regular',

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
    fontFamily: 'Prompt_500Medium',

    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontFamily: 'Prompt_500Medium',

    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  genderButtonTextActive: {
    color: colors.white,
  },
  datePickerButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  datePickerText: {
    fontFamily: 'Prompt_400Regular',

    flex: 1,
    fontSize: 16,
    color: colors.foreground,
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
    fontFamily: 'Prompt_400Regular',

    fontSize: 16,
    color: colors.foreground,
  },
  textareaContainer: {
    marginBottom: 16,
  },
  textarea: {
    fontFamily: 'Prompt_400Regular',

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
