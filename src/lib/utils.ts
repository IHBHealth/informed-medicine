import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export const CATEGORIES = [
  { value: "heart-health", label: "Heart Health" },
  { value: "mental-health", label: "Mental Health" },
  { value: "nutrition", label: "Nutrition" },
  { value: "fitness", label: "Fitness" },
  { value: "sleep", label: "Sleep" },
  { value: "diabetes", label: "Diabetes" },
  { value: "cancer", label: "Cancer" },
  { value: "womens-health", label: "Women's Health" },
  { value: "mens-health", label: "Men's Health" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "medications", label: "Medications" },
  { value: "general", label: "General" },
];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const CATEGORY_COLORS: Record<string, string> = {
  "heart-health": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "mental-health": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "nutrition": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "fitness": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "sleep": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  "diabetes": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "cancer": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "womens-health": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "mens-health": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "pediatrics": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "medications": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "general": "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

export const SITE_NAME = "InformedMedicine";
export const SITE_URL = "https://informedmedicine.com";
export const SITE_DESCRIPTION = "Evidence-based health articles, expert Q&A, drug information, lab test guides, and supplement reviews. Trusted health information you can understand.";
