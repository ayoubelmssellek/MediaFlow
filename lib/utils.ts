export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
