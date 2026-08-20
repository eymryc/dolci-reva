import { Text as RNText, type TextProps } from 'react-native';
import { cn } from '@/core/lib/cn';

/**
 * Toute l'app web utilise Rajdhani comme police principale (cf.
 * app/layout.tsx, next/font/google). Ce composant applique la même police
 * par défaut à tout le texte mobile, avec les mêmes poids que la palette
 * web (regular/medium/semibold/bold).
 */
export function Text({ className, style, ...props }: TextProps & { className?: string }) {
  return <RNText className={cn('font-rajdhani text-theme-secondary', className)} style={style} {...props} />;
}
