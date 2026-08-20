import { Pressable, ActivityIndicator, type PressableProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/lib/cn';
import { Text } from './Text';
import { colors } from '@/core/theme/colors';

/**
 * Mêmes variantes que dolci-reva-web/components/ui/button.tsx pour garder
 * le même vocabulaire de design entre web et mobile.
 */
const buttonVariants = cva('flex-row items-center justify-center gap-2 rounded-lg active:opacity-80', {
  variants: {
    variant: {
      default: 'bg-theme-primary',
      destructive: 'bg-theme-error',
      outline: 'border border-gray-300 bg-white',
      secondary: 'bg-gray-100',
      ghost: 'bg-transparent',
    },
    size: {
      default: 'h-11 px-5',
      sm: 'h-9 px-3.5',
      lg: 'h-12 px-6',
      icon: 'h-11 w-11',
    },
    disabled: {
      true: 'opacity-50',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const textVariants = cva('font-rajdhani-semibold text-center', {
  variants: {
    variant: {
      default: 'text-white',
      destructive: 'text-white',
      outline: 'text-theme-secondary',
      secondary: 'text-theme-secondary',
      ghost: 'text-theme-primary',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
      icon: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface ButtonProps
  extends Omit<PressableProps, 'children'>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function Button({
  children,
  variant,
  size,
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, disabled: isDisabled }), className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white} size="small" />
      ) : typeof children === 'string' ? (
        <Text className={textVariants({ variant, size })}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
