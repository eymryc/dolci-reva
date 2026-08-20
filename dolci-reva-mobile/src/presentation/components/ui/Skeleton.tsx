import { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps } from 'react-native';
import { cn } from '@/core/lib/cn';

export function Skeleton({ className, ...props }: ViewProps & { className?: string }) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View className={cn('rounded-lg bg-gray-200', className)} {...props} />
    </Animated.View>
  );
}
