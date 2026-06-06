import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractErrorMessage(fallback: string, error: unknown): string {
  if (!error) return fallback;

  const raw = (error as { value?: unknown; message?: string }).value ?? error;

  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as { message?: string };
    if (typeof first?.message === "string") {
      return first.message;
    }
  }

  if (typeof raw === "string") return raw;
  if (
    typeof raw === "object" &&
    raw !== null &&
    "message" in raw &&
    typeof (raw as { message: unknown }).message === "string"
  )
    return (raw as { message: string }).message;

  return fallback;
}
