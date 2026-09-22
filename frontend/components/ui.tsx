import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45', className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-12 w-full rounded-2xl border border-line bg-white/80 px-4 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-moss focus:ring-4 focus:ring-moss/10', className)} {...props} />;
}
