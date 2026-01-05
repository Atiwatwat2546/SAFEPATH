import React, { useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const navigationRef = useRef<NavigationContainerRef<any> | null>(null);
  const routeNameRef = useRef<string | undefined>(undefined);

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          const currentRoute = navigationRef.current?.getCurrentRoute();
          routeNameRef.current = currentRoute?.name;
          if (currentRoute) {
            console.log('[NAV_READY]', {
              initialRoute: currentRoute.name,
              time: new Date().toISOString(),
            });
          }
        }}
        onStateChange={() => {
          const previousRouteName = routeNameRef.current;
          const currentRoute = navigationRef.current?.getCurrentRoute();
          const currentRouteName = currentRoute?.name;

          if (currentRouteName && previousRouteName !== currentRouteName) {
            console.log('[NAVIGATE]', {
              from: previousRouteName || null,
              to: currentRouteName,
              params: currentRoute?.params || null,
              time: new Date().toISOString(),
            });
          }

          routeNameRef.current = currentRouteName;
        }}
      >
        <StatusBar style="auto" />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
