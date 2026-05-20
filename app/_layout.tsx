import 'react-native-reanimated';
import '../global.css';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { LanguageProvider, useLanguage } from '@/hooks/use-language';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ThemeProvider as UIThemeProvider } from '@/components/ui/theme';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { Platform, ActivityIndicator, View } from 'react-native';
import { Logo } from '@/components/logo';

const getConvexUrl = () => {
  let url = process.env.EXPO_PUBLIC_CONVEX_URL;
  
  if (typeof (globalThis as any).window !== "undefined") {
    const host = (globalThis as any).window.location.host;
    if (host.includes(".app.cto.new")) {
      const backendHost = host.replace("3000-", "3210-");
      return `https://${backendHost}`;
    }
  }

  if (!url) {
    return "https://placeholder.convex.cloud";
  }
  return url;
};

const convex = new ConvexReactClient(getConvexUrl());

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { userId, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!userId && !inAuthGroup) {
      router.replace("/auth");
    } else if (userId && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [userId, isLoading, segments]);

  return <>{children}</>;
}

function LayoutContent() {
  const { isRTL } = useLanguage();

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
      <BottomSheetModalProvider>
        <UIThemeProvider>
          <ThemeProvider value={DarkTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="watch/[type]/[id]" />
              <Stack.Screen name="category" />
              <Stack.Screen name="player" />
              <Stack.Screen name="+not-found" options={{ headerShown: true }} />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </UIThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof (globalThis as any).window !== 'undefined') {
      const win = (globalThis as any).window;
      const nav = (globalThis as any).navigator;
      const doc = (globalThis as any).document;

      // Register Service Worker
      if ('serviceWorker' in nav) {
        win.addEventListener('load', () => {
          nav.serviceWorker.register('/sw.js').then((registration: any) => {
            console.log('SW registered: ', registration);
          }).catch((registrationError: any) => {
            console.log('SW registration failed: ', registrationError);
          });
        });
      }

      // Add Manifest link if not exists
      if (doc && !doc.querySelector('link[rel="manifest"]')) {
        const link = doc.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.json';
        doc.head.appendChild(link);
      }

      // Add Favicon
      if (doc && !doc.querySelector('link[rel="icon"]')) {
        const link = doc.createElement('link');
        link.rel = 'icon';
        link.href = '/logo.svg';
        document.head.appendChild(link);
      }

      // Add Theme Color
      if (doc && !doc.querySelector('meta[name="theme-color"]')) {
        const meta = doc.createElement('meta');
        meta.name = 'theme-color';
        meta.content = '#dc2626';
        doc.head.appendChild(meta);
      }

      // iOS PWA Support
      if (doc && !doc.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
        const meta = doc.createElement('meta');
        meta.name = 'apple-mobile-web-app-capable';
        meta.content = 'yes';
        doc.head.appendChild(meta);
      }
      if (doc && !doc.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
        const meta = doc.createElement('meta');
        meta.name = 'apple-mobile-web-app-status-bar-style';
        meta.content = 'black-translucent';
        doc.head.appendChild(meta);
      }
      if (doc && !doc.querySelector('link[rel="apple-touch-icon"]')) {
        const link = doc.createElement('link');
        link.rel = 'apple-touch-icon';
        link.href = '/logo.svg'; // Using SVG as it's high res
        doc.head.appendChild(link);
      }
    }
  }, []);

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Logo size="lg" className="mb-4" />
        <ActivityIndicator color="#dc2626" size="large" />
      </View>
    );
  }

  return (
    <ConvexProvider client={convex}>
      <AuthProvider>
        <LanguageProvider>
          <AuthGuard>
            <LayoutContent />
            <PWAInstallPrompt />
          </AuthGuard>
        </LanguageProvider>
      </AuthProvider>
    </ConvexProvider>
  );
}
