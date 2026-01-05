import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { RootStackParamList } from '../navigation/AppNavigator';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import colors from '../theme/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

const { width } = Dimensions.get('window');

const Booking1Screen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);

  // Default to Bangkok coordinates
  const defaultRegion = {
    latitude: 13.7563,
    longitude: 100.5018,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleNext = () => {
    if (!fromAddress || !toAddress) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุสถานที่ต้นทางและปลายทาง');
      return;
    }
    navigation.navigate('Booking2', {
      fromLocation,
      toLocation,
      fromAddress,
      toAddress,
    });
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
            style={styles.map}
            initialRegion={defaultRegion}
          >
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
            <View style={styles.inputRow}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>ต้นทาง (รับผู้โดยสาร)</Text>
                <Input
                  placeholder="ระบุสถานที่ต้นทาง"
                  value={fromAddress}
                  onChangeText={setFromAddress}
                  containerStyle={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>ปลายทาง (ส่งผู้โดยสาร)</Text>
                <Input
                  placeholder="ระบุสถานที่ปลายทาง"
                  value={toAddress}
                  onChangeText={setToAddress}
                  containerStyle={styles.input}
                />
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
    gap: 16,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    marginBottom: 0,
  },
  nextButton: {
    marginTop: 24,
  },
});

export default Booking1Screen;
