import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_700Bold,
  useFonts,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppText, Card, Screen } from '../src/components/ui';
import { ar } from '../src/i18n/ar';
import { AuthProvider, useAuth } from '../src/lib/auth';
import { isConfigured } from '../src/lib/config';

// Arabic-only app. Native RTL is forced by the expo-localization plugin
// (app.json → forcesRTL). This JS call covers Expo Go / dev clients built
// before the plugin was applied.
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

void SplashScreen.preventAutoHideAsync();

function Gate() {
  const { session, ready } = useAuth();
  if (!ready) return null;
  const signedIn = Boolean(session);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isConfigured ? (
        <AuthProvider>
          <Gate />
        </AuthProvider>
      ) : (
        <Screen>
          <Card title={ar.config.title}>
            <AppText>{ar.config.body}</AppText>
          </Card>
        </Screen>
      )}
    </SafeAreaProvider>
  );
}
