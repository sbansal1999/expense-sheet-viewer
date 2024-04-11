import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFormattedAmount(moneyString: string | number) {
  return `₹ ${moneyString}`;
}

export function roundOffDecimalPlaces(val: number, digitsAfterDecimal: number) {
  return (
    Math.round((val + Number.EPSILON) * Math.pow(10, digitsAfterDecimal)) /
    Math.pow(10, digitsAfterDecimal)
  );
}