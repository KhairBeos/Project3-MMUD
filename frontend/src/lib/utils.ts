import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm này giúp gộp class Tailwind thông minh
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}