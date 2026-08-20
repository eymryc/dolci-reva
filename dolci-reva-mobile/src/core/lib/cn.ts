import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Identique à dolci-reva-web/lib/utils.ts (cn) pour garder les mêmes réflexes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
