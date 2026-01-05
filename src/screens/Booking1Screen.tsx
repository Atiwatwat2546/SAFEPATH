import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import colors from '../theme/colors';
import { setPendingBooking, clearPendingBooking } from '../services/bookingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

const { width } = Dimensions.get('window');

const Booking1Screen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 13.7563,
    longitude: 100.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    clearPendingBooking();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      
      // ขอ permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตให้แอปเข้าถึงตำแหน่งของคุณ');
        return;
      }

      // ดึงตำแหน่งปัจจุบัน
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLoc: Location = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(currentLoc);
      
      // อัปเดตแมพให้แสดงตำแหน่งปัจจุบัน
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      // ดึงชื่อสถานที่จากพิกัด
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const addr = addresses[0];
        const addressString = `${addr.street || ''} ${addr.district || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
        currentLoc.address = addressString;
      }

      setCurrentLocation(currentLoc);
    } catch (error) {
      console.log('[LOCATION_ERROR]', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงตำแหน่งปัจจุบันได้');
    } finally {
      setLoadingLocation(false);
    }
  };

  const useCurrentLocationAsOrigin = () => {
    if (!currentLocation) {
      Alert.alert('ไม่พบตำแหน่ง', 'กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
      return;
    }
    setFromLocation(currentLocation);
    setFromAddress(currentLocation.address || 'ตำแหน่งปัจจุบัน');
    Alert.alert('สำเร็จ', 'ใช้ตำแหน่งปัจจุบันเป็นต้นทางแล้ว');
  };


  const handleNext = () => {
    if (!fromAddress || !toAddress) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุสถานที่ต้นทางและปลายทาง');
      return;
    }
    setPendingBooking({
      fromAddress,
      toAddress,
      fromLocation,
      toLocation,
    });
    navigation.navigate('Booking2' as any);
  };

  const steps = [
    { number: 1, active: true },
    { number: 2, active: false },
    { number: 3, active: false },
    { number: 4, active: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>จองบริการ</Text>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View
            key={step.number}
            style={[styles.step, step.active && styles.stepActive]}
          >
            <Text style={[styles.stepText, step.active && styles.stepTextActive]}>
              {step.number}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.lat,
                  longitude: currentLocation.lng,
                }}
                title="ตำแหน่งปัจจุบัน"
                description={currentLocation.address}
                pinColor="blue"
              />
            )}
            {fromLocation && (
              <Marker
                coordinate={{
                  latitude: fromLocation.lat,
                  longitude: fromLocation.lng,
                }}
                title="ต้นทาง"
                pinColor={colors.primary}
              />
            )}
            {toLocation && (
              <Marker
                coordinate={{
                  latitude: toLocation.lat,
                  longitude: toLocation.lng,
                }}
                title="ปลายทาง"
                pinColor={colors.destructive}
              />
            )}
          </MapView>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            <View style={[styles.inputRow, { zIndex: 2 }]}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.inputWrapper}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>ต้นทาง (รับผู้โดยสาร)</Text>
                  <TouchableOpacity 
                    onPress={useCurrentLocationAsOrigin}
                    style={styles.locationButton}
                    disabled={loadingLocation}
                  >
                    {loadingLocation ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="locate" size={16} color={colors.primary} />
                        <Text style={styles.locationButtonText}>ใช้ตำแหน่งปัจจุบัน</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <Input
                  placeholder="พิมพ์ชื่อสถานที่ต้นทาง"
                  value={fromAddress}
                  onChangeText={setFromAddress}
                  containerStyle={styles.input}
                />
                <Text style={styles.helperText}>💡 กดปุ่ม "ใช้ตำแหน่งปัจจุบัน" หรือพิมพ์ชื่อสถานที่</Text>
              </View>
            </View>

            <View style={[styles.inputRow, { zIndex: 1 }]}>
              <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>ปลายทาง (ส่งผู้โดยสาร)</Text>
                <Input
                  placeholder="พิมพ์ชื่อสถานที่ปลายทาง"
                  value={toAddress}
                  onChangeText={setToAddress}
                  containerStyle={styles.input}
                />
                <Text style={styles.helperText}>💡 พิมพ์ชื่อสถานที่ เช่น "สนามบินสุวรรณภูมิ"</Text>
              </View>
            </View>
          </View>

          <Button onPress={handleNext} style={styles.nextButton}>
            ต่อไป
          </Button>
        </View>
      </View>
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
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: {
    backgroundColor: colors.primary,
  },
  stepText: {
    fontFamily: 'Prompt_600SemiBold',

    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  stepTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    gap: 32,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 32,
  },
  inputWrapper: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontFamily: 'Prompt_500Medium',

    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.primary + '15',
  },
  locationButtonText: {
    fontFamily: 'Prompt_500Medium',

    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  helperText: {
    fontFamily: 'Prompt_400Regular',

    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  input: {
    marginBottom: 0,
  },
  nextButton: {
    marginTop: 24,
  },
});

export default Booking1Screen;
