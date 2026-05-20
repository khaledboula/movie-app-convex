import React from 'react';
import { Text, View } from '@/components/ui';
import { cn } from '@/components/ui/utils/cn';
import { LinearGradient } from 'expo-linear-gradient';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const textSizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };

  const containerSizes = {
    sm: 'px-3 py-1',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
    xl: 'px-8 py-4',
  };

  return (
    <View className={cn("flex-row items-center", className)}>
      <View className={cn("border border-red-600/30 rounded-2xl overflow-hidden shadow-2xl shadow-red-600/20", containerSizes[size])}>
        <Text 
          className={cn(
            "text-red-600 font-black italic uppercase tracking-tighter",
            textSizes[size]
          )}
          style={{
            textShadowColor: 'rgba(220, 38, 38, 0.5)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 15,
          }}
        >
          Cineverse+
        </Text>
      </View>
    </View>
  );
}
