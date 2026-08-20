import { forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { cn } from '@/core/lib/cn';
import { Text } from './Text';
import { colors } from '@/core/theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <View className="gap-1.5">
        {label && <Text className="text-sm font-rajdhani-medium text-gray-700">{label}</Text>}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.gray[400]}
          className={cn(
            'h-12 rounded-lg border border-gray-300 bg-white px-4 font-rajdhani text-base text-theme-secondary',
            error && 'border-theme-error',
            className
          )}
          {...props}
        />
        {error && <Text className="text-xs text-theme-error">{error}</Text>}
      </View>
    );
  }
);
Input.displayName = 'Input';
