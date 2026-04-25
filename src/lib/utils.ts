import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatTagLabel(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatValue(value: string | null) {
  return value ?? "Not reported";
}

export function toIdArray(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  const raw = Array.isArray(value) ? value : [value];

  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry));
}
