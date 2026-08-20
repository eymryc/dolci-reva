import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/lib/cn';
import { Text } from './Text';

const badgeVariants = cva('self-start rounded-full px-2.5 py-1', {
  variants: {
    variant: {
      default: 'bg-theme-primary',
      success: 'bg-theme-success',
      warning: 'bg-theme-warning',
      error: 'bg-theme-error',
      secondary: 'bg-gray-100',
    },
  },
  defaultVariants: { variant: 'default' },
});

const textVariants = cva('text-xs font-rajdhani-semibold', {
  variants: {
    variant: {
      default: 'text-white',
      success: 'text-white',
      warning: 'text-white',
      error: 'text-white',
      secondary: 'text-gray-700',
    },
  },
  defaultVariants: { variant: 'default' },
});

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: string;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <Text className={textVariants({ variant })}>{children}</Text>
    </View>
  );
}
