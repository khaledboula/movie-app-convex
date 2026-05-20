import React, { useEffect, useState } from 'react';
import { View, Text, Button, Pressable } from '@/components/ui';
import { Download, X, Film } from 'lucide-react-native';
import * as Animatable from 'react-native-animatable';
import { Platform } from 'react-native';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const win = (globalThis as any).window;

    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install button
      setIsVisible(true);
    };

    if (win) {
      win.addEventListener('beforeinstallprompt', handler);

      // Check if already installed
      if (win.matchMedia && win.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(false);
      }
    }

    return () => {
      if (win) {
        win.removeEventListener('beforeinstallprompt', handler);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600}
      className="absolute bottom-28 left-6 right-6 z-[100]"
    >
      <View className="bg-black/60 backdrop-blur-3xl border border-red-600/40 p-8 rounded-[40px] shadow-2xl shadow-red-600/30 overflow-hidden">
        {/* Glowing effect background */}
        <View className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/20 rounded-full blur-3xl" />
        <View className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-600/10 rounded-full blur-3xl" />

        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-red-600 rounded-[28px] items-center justify-center mb-4 shadow-2xl shadow-red-600/50 border border-white/20">
            <Film color="white" size={40} />
          </View>
          <Text className="text-white font-black italic uppercase tracking-tighter text-3xl mb-1">Cineverse+</Text>
          <Text className="text-red-500/80 text-[10px] font-bold uppercase tracking-[4px]">Premium Streaming</Text>
        </View>
        
        <Text className="text-white/70 text-center text-base mb-8 leading-relaxed font-medium">
          Install Cineverse+ for the best cinematic experience with offline viewing and full-screen immersion.
        </Text>
        
        <View className="flex-row gap-3">
          <Button 
            onPress={() => setIsVisible(false)}
            variant="outline"
            className="flex-1 h-16 rounded-2xl border-white/10 bg-white/5"
          >
            <Text className="text-white font-bold uppercase tracking-widest text-xs">Later</Text>
          </Button>
          <Button 
            onPress={handleInstall}
            className="flex-[2] h-16 rounded-2xl bg-red-600 flex-row items-center justify-center shadow-xl shadow-red-600/40 active:scale-[0.98] border border-white/20"
          >
            <Download size={20} color="white" className="mr-2" />
            <Text className="text-white font-black uppercase tracking-widest text-sm">Install Now</Text>
          </Button>
        </View>
      </View>
    </Animatable.View>
  );
}
