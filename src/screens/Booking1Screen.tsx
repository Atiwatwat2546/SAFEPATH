import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ActivityIndicator, TextInput, FlatList, ScrollView } from 'react-native';
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
import { calculateDistanceAndFare } from '../utils/distanceCalculator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// ข้อมูลโรงพยาบาลในประเทศไทย
const HOSPITALS = [
  // โรงพยาบาลรัฐในกรุงเทพฯ
  { id: '1', name: 'โรงพยาบาลศิริราช', address: 'แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ', lat: 13.7584, lng: 100.4865 },
  { id: '2', name: 'โรงพยาบาลจุฬาลงกรณ์', address: 'แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ', lat: 13.7326, lng: 100.5327 },
  { id: '3', name: 'โรงพยาบาลรามาธิบดี', address: 'แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ', lat: 13.7596, lng: 100.5299 },
  { id: '14', name: 'โรงพยาบาลราชวิถี', address: 'แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ', lat: 13.7584, lng: 100.5324 },
  { id: '15', name: 'โรงพยาบาลพระมงกุฎเกล้า', address: 'แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ', lat: 13.7641, lng: 100.5367 },
  { id: '16', name: 'โรงพยาบาลตำรวจ', address: 'แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ', lat: 13.7899, lng: 100.5294 },
  { id: '17', name: 'โรงพยาบาลภูมิพลอดุลยเดช', address: 'แขวงสายไหม เขตสายไหม กรุงเทพฯ', lat: 13.9138, lng: 100.6445 },
  { id: '18', name: 'โรงพยาบาลเจ้าพระยา', address: 'แขวงมหาพฤฒาราม เขตบางรัก กรุงเทพฯ', lat: 13.7234, lng: 100.5089 },
  { id: '19', name: 'โรงพยาบาลกลาง', address: 'แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพฯ', lat: 13.7689, lng: 100.5089 },
  { id: '20', name: 'โรงพยาบาลหัวเฉียว', address: 'แขวงบางนา เขตบางนา กรุงเทพฯ', lat: 13.6689, lng: 100.6234 },
  { id: '21', name: 'โรงพยาบาลเวชการุณย์รัศมิ์', address: 'แขวงบางแค เขตบางแค กรุงเทพฯ', lat: 13.7089, lng: 100.3989 },
  { id: '22', name: 'โรงพยาบาลราชพิพัฒน์', address: 'แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ', lat: 13.7556, lng: 100.5389 },
  { id: '23', name: 'โรงพยาบาลลาดกระบัง', address: 'แขวงลาดกระบัง เขตลาดกระบัง กรุงเทพฯ', lat: 13.7234, lng: 100.7456 },
  { id: '24', name: 'โรงพยาบาลเลิดสิน', address: 'แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ', lat: 13.7645, lng: 100.4789 },
  { id: '25', name: 'โรงพยาบาลตากสิน', address: 'แขวงสำเหร่ เขตธนบุรี กรุงเทพฯ', lat: 13.7234, lng: 100.4789 },
  
  // โรงพยาบาลเอกชนในกรุงเทพฯ
  { id: '7', name: 'โรงพยาบาลบำรุงราษฎร์', address: 'แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ', lat: 13.7378, lng: 100.5596 },
  { id: '8', name: 'โรงพยาบาลสมิติเวช', address: 'แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ', lat: 13.7242, lng: 100.6436 },
  { id: '9', name: 'โรงพยาบาลกรุงเทพ', address: 'แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ', lat: 13.7563, lng: 100.5746 },
  { id: '10', name: 'โรงพยาบาลเซนต์หลุยส์', address: 'แขวงยานนาวา เขตสาทร กรุงเทพฯ', lat: 13.7194, lng: 100.5271 },
  { id: '11', name: 'โรงพยาบาลพญาไท 2', address: 'แขวงพญาไท เขตพญาไท กรุงเทพฯ', lat: 13.7781, lng: 100.5447 },
  { id: '12', name: 'โรงพยาบาลวิชัยเวช', address: 'แขวงสามเสนใน เขตพญาไท กรุงเทพฯ', lat: 13.7826, lng: 100.5454 },
  { id: '13', name: 'โรงพยาบาลเปาโล', address: 'แขวงจอมพล เขตจตุจักร กรุงเทพฯ', lat: 13.8058, lng: 100.5615 },
  { id: '26', name: 'โรงพยาบาลกรุงเทพคริสเตียน', address: 'แขวงสีลม เขตบางรัก กรุงเทพฯ', lat: 13.7289, lng: 100.5234 },
  { id: '27', name: 'โรงพยาบาลเมดพาร์ค', address: 'แขวงคลองตัน เขตคลองเตย กรุงเทพฯ', lat: 13.7189, lng: 100.5689 },
  { id: '28', name: 'โรงพยาบาลซามิติเวช ศรีนครินทร์', address: 'แขวงหนองบอน เขตประเวศ กรุงเทพฯ', lat: 13.7089, lng: 100.6534 },
  { id: '29', name: 'โรงพยาบาลกรุงเทพพัฒนา', address: 'แขวงสวนหลวง เขตสวนหลวง กรุงเทพฯ', lat: 13.7334, lng: 100.6389 },
  { id: '30', name: 'โรงพยาบาลเปรมเมียร์', address: 'แขวงบางนา เขตบางนา กรุงเทพฯ', lat: 13.6689, lng: 100.6089 },
  { id: '31', name: 'โรงพยาบาลพญาไท 1', address: 'แขวงพญาไท เขตพญาไท กรุงเทพฯ', lat: 13.7734, lng: 100.5389 },
  { id: '32', name: 'โรงพยาบาลพญาไท 3', address: 'แขวงสามเสนใน เขตพญาไท กรุงเทพฯ', lat: 13.7889, lng: 100.5489 },
  { id: '33', name: 'โรงพยาบาลเซนต์คาร์ลอส', address: 'แขวงบางนา เขตบางนา กรุงเทพฯ', lat: 13.6634, lng: 100.6189 },
  { id: '34', name: 'โรงพยาบาลกรุงเทพราชสีมา', address: 'แขวงบางแค เขตบางแค กรุงเทพฯ', lat: 13.7134, lng: 100.3889 },
  { id: '35', name: 'โรงพยาบาลเทพธารินทร์', address: 'แขวงบางนา เขตบางนา กรุงเทพฯ', lat: 13.6589, lng: 100.6234 },
  { id: '36', name: 'โรงพยาบาลเกษมราษฎร์ รัชดา', address: 'แขวงดินแดง เขตดินแดง กรุงเทพฯ', lat: 13.7634, lng: 100.5589 },
  { id: '37', name: 'โรงพยาบาลเกษมราษฎร์ ประชาชื่น', address: 'แขวงบางซื่อ เขตบางซื่อ กรุงเทพฯ', lat: 13.7989, lng: 100.5234 },
  { id: '38', name: 'โรงพยาบาลเกษมราษฎร์ รามคำแหง', address: 'แขวงหัวหมาก เขตบางกะปิ กรุงเทพฯ', lat: 13.7589, lng: 100.6434 },
  { id: '39', name: 'โรงพยาบาลเกษมราษฎร์ พระราม 9', address: 'แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ', lat: 13.7589, lng: 100.5789 },
  { id: '40', name: 'โรงพยาบาลเกษมราษฎร์ บางแค', address: 'แขวงบางแค เขตบางแค กรุงเทพฯ', lat: 13.7189, lng: 100.3989 },
  
  // โรงพยาบาลในสุราษฎร์ธานี
  { id: '41', name: 'โรงพยาบาลสุราษฎร์ธานี', address: 'ตำบลตลาด อำเภอเมือง สุราษฎร์ธานี', lat: 9.1389, lng: 99.3334 },
  { id: '42', name: 'โรงพยาบาลกาญจนดิษฐ์', address: 'ตำบลมะขามเตี้ย อำเภอเมือง สุราษฎร์ธานี', lat: 9.1234, lng: 99.3189 },
  { id: '43', name: 'โรงพยาบาลสุราษฎร์ธานี อินเตอร์', address: 'ตำบลวัดประดู่ อำเภอเมือง สุราษฎร์ธานี', lat: 9.1489, lng: 99.3289 },
  { id: '44', name: 'โรงพยาบาลทักษิณ', address: 'ตำบลตลาด อำเภอเมือง สุราษฎร์ธานี', lat: 9.1334, lng: 99.3234 },
  { id: '45', name: 'โรงพยาบาลเจ้าพระยาสุราษฎร์ธานี', address: 'ตำบลมะขามเตี้ย อำเภอเมือง สุราษฎร์ธานี', lat: 9.1289, lng: 99.3134 },
  { id: '46', name: 'โรงพยาบาลกาญจนาภิเษก', address: 'ตำบลขุนทะเล อำเภอเมือง สุราษฎร์ธานี', lat: 9.1534, lng: 99.3389 },
  { id: '47', name: 'โรงพยาบาลดอนสัก', address: 'ตำบลดอนสัก อำเภอดอนสัก สุราษฎร์ธานี', lat: 9.3234, lng: 99.6789 },
  { id: '48', name: 'โรงพยาบาลเกาะสมุย', address: 'ตำบลอ่างทอง อำเภอเกาะสมุย สุราษฎร์ธานี', lat: 9.5234, lng: 100.0134 },
  { id: '49', name: 'โรงพยาบาลเกาะพะงัน', address: 'ตำบลเกาะพะงัน อำเภอเกาะพะงัน สุราษฎร์ธานี', lat: 9.7389, lng: 100.0234 },
  { id: '50', name: 'โรงพยาบาลชัยบุรี', address: 'ตำบลชัยบุรี อำเภอชัยบุรี สุราษฎร์ธานี', lat: 8.9789, lng: 98.9234 },
  
  // โรงพยาบาลมหาวิทยาลัยในภูมิภาคอื่นๆ (เดิม)
  { id: '4', name: 'โรงพยาบาลศรีนครินทร์', address: 'ตำบลในเมือง อำเภอเมือง ขอนแก่น', lat: 16.4322, lng: 102.8236 },
  { id: '5', name: 'โรงพยาบาลสงขลานครินทร์', address: 'ตำบลหาดใหญ่ อำเภอหาดใหญ่ สงขลา', lat: 7.0089, lng: 100.4969 },
  { id: '6', name: 'โรงพยาบาลมหาราชนครเชียงใหม่', address: 'ตำบลศรีภูมิ อำเภอเมือง เชียงใหม่', lat: 18.7956, lng: 98.9664 },
];

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
  const [fromSuggestions, setFromSuggestions] = useState<typeof HOSPITALS>([]);
  const [toSuggestions, setToSuggestions] = useState<typeof HOSPITALS>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [fare, setFare] = useState<number>(0);
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
    setShowFromSuggestions(false);
    Alert.alert('สำเร็จ', 'ใช้ตำแหน่งปัจจุบันเป็นต้นทางแล้ว');
  };

  // ค้นหาโรงพยาบาลจากฐานข้อมูลท้องถิ่น
  const searchHospitals = (query: string, isOrigin: boolean) => {
    if (query.length < 2) {
      if (isOrigin) {
        setFromSuggestions([]);
        setShowFromSuggestions(false);
      } else {
        setToSuggestions([]);
        setShowToSuggestions(false);
      }
      return;
    }

    const filtered = HOSPITALS.filter(hospital =>
      hospital.name.toLowerCase().includes(query.toLowerCase()) ||
      hospital.address.toLowerCase().includes(query.toLowerCase())
    );

    if (isOrigin) {
      setFromSuggestions(filtered);
      setShowFromSuggestions(filtered.length > 0);
    } else {
      setToSuggestions(filtered);
      setShowToSuggestions(filtered.length > 0);
    }
  };

  // เลือกโรงพยาบาล
  const selectHospital = (hospital: typeof HOSPITALS[0], isOrigin: boolean) => {
    const location: Location = {
      lat: hospital.lat,
      lng: hospital.lng,
      address: `${hospital.name}, ${hospital.address}`,
    };

    if (isOrigin) {
      setFromLocation(location);
      setFromAddress(`${hospital.name}, ${hospital.address}`);
      setShowFromSuggestions(false);
    } else {
      setToLocation(location);
      setToAddress(`${hospital.name}, ${hospital.address}`);
      setShowToSuggestions(false);
    }
  };

  const handleFromAddressChange = (text: string) => {
    setFromAddress(text);
    searchHospitals(text, true);
  };

  const handleToAddressChange = (text: string) => {
    setToAddress(text);
    searchHospitals(text, false);
  };


  // คำนวณระยะทางและค่าโดยสารเมื่อมีทั้งต้นทางและปลายทาง
  useEffect(() => {
    if (fromLocation && toLocation) {
      const result = calculateDistanceAndFare(
        fromLocation.lat,
        fromLocation.lng,
        toLocation.lat,
        toLocation.lng
      );
      setDistance(result.distance);
      setFare(result.fare);
    } else {
      setDistance(0);
      setFare(0);
    }
  }, [fromLocation, toLocation]);

  const handleNext = () => {
    if (!fromAddress || !toAddress) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุสถานที่ต้นทางและปลายทาง');
      return;
    }
    if (!fromLocation || !toLocation) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกสถานที่จาก dropdown');
      return;
    }
    setPendingBooking({
      fromAddress,
      toAddress,
      fromLocation,
      toLocation,
      distance,
      fare,
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
                <View>
                  <TextInput
                    placeholder="พิมพ์ชื่อโรงพยาบาล"
                    value={fromAddress}
                    onChangeText={handleFromAddressChange}
                    style={styles.textInput}
                    placeholderTextColor={colors.mutedForeground}
                  />
                  {showFromSuggestions && (
                    <View style={styles.suggestionsContainer}>
                      <FlatList
                        data={fromSuggestions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => selectHospital(item, true)}
                          >
                            <Ionicons name="medical" size={20} color={colors.primary} />
                            <View style={styles.suggestionTextContainer}>
                              <Text style={styles.suggestionMainText}>{item.name}</Text>
                              <Text style={styles.suggestionSecondaryText}>{item.address}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        style={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                      />
                    </View>
                  )}
                </View>
                <Text style={styles.helperText}>💡 กดปุ่ม "ใช้ตำแหน่งปัจจุบัน" หรือพิมพ์ชื่อโรงพยาบาล</Text>
              </View>
            </View>

            <View style={[styles.inputRow, { zIndex: 1 }]}>
              <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>ปลายทาง (ส่งผู้โดยสาร)</Text>
                <View>
                  <TextInput
                    placeholder="พิมพ์ชื่อโรงพยาบาล"
                    value={toAddress}
                    onChangeText={handleToAddressChange}
                    style={styles.textInput}
                    placeholderTextColor={colors.mutedForeground}
                  />
                  {showToSuggestions && (
                    <View style={styles.suggestionsContainer}>
                      <FlatList
                        data={toSuggestions}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.suggestionItem}
                            onPress={() => selectHospital(item, false)}
                          >
                            <Ionicons name="medical" size={20} color={colors.primary} />
                            <View style={styles.suggestionTextContainer}>
                              <Text style={styles.suggestionMainText}>{item.name}</Text>
                              <Text style={styles.suggestionSecondaryText}>{item.address}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        style={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                      />
                    </View>
                  )}
                </View>
                <Text style={styles.helperText}>💡 พิมพ์ชื่อโรงพยาบาล</Text>
              </View>
            </View>
          </View>

          {distance > 0 && fare > 0 && (
            <View style={styles.fareContainer}>
              <View style={styles.fareRow}>
                <Ionicons name="navigate" size={20} color={colors.primary} />
                <Text style={styles.fareLabel}>ระยะทาง:</Text>
                <Text style={styles.fareValue}>{distance.toFixed(1)} กม.</Text>
              </View>
              <View style={styles.fareRow}>
                <Ionicons name="cash" size={20} color={colors.primary} />
                <Text style={styles.fareLabel}>ค่าโดยสาร:</Text>
                <Text style={styles.fareValue}>{fare.toLocaleString()} บาท</Text>
              </View>
              <View style={styles.fareNote}>
                <Text style={styles.fareNoteText}>💡 คิดค่าโดยสาร 50 บาท/กิโลเมตร</Text>
              </View>
            </View>
          )}

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
  textInput: {
    fontFamily: 'Prompt_400Regular',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.card,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontFamily: 'Prompt_500Medium',
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontFamily: 'Prompt_400Regular',
    fontSize: 12,
    color: colors.mutedForeground,
  },
  fareContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fareLabel: {
    fontFamily: 'Prompt_500Medium',
    fontSize: 14,
    color: colors.foreground,
    flex: 1,
  },
  fareValue: {
    fontFamily: 'Prompt_700Bold',
    fontSize: 16,
    color: colors.primary,
  },
  fareNote: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fareNoteText: {
    fontFamily: 'Prompt_400Regular',
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: 24,
  },
});

export default Booking1Screen;
