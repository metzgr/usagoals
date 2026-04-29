export const catalogPreviewModes = ["network", "summary"] as const;

export type CatalogPreviewMode = (typeof catalogPreviewModes)[number];

export function getCatalogPreviewMode(value: string | undefined | null) {
  return value === "summary" ? "summary" : "network";
}
