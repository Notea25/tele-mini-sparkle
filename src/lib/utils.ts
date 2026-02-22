import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from backend (×10) to frontend display (÷10)
 * Example: 69 (backend) -> 6.9 (frontend display)
 * @param backendPrice Price value from backend API (scaled by 10)
 * @returns Display price rounded to 1 decimal place
 */
export function formatPrice(backendPrice: number): number {
  return Math.round(backendPrice / 10 * 10) / 10;
}

/**
 * Format budget from backend (×10) to frontend display (÷10)
 * Example: 1000 (backend) -> 100.0 (frontend display)
 * @param backendBudget Budget value from backend API (scaled by 10)
 * @returns Display budget rounded to 1 decimal place
 */
export function formatBudget(backendBudget: number): number {
  return Math.round(backendBudget / 10 * 10) / 10;
}
