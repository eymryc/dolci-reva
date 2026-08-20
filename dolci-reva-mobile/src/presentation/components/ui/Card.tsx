import { View, type ViewProps } from 'react-native';
import { cn } from '@/core/lib/cn';

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('rounded-2xl border border-gray-100 bg-white shadow-sm', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('p-4', className)} {...props} />;
}
