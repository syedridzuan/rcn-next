// lib/utils/slug.ts
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

// Overloaded or optional config
export function formatDate(date: Date, options?: { time?: boolean }): string {
  // E.g., if not provided, default is false => no time
  const showTime = options?.time ?? false;

  return new Intl.DateTimeFormat("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(showTime && { hour: "numeric", minute: "numeric" }),
  }).format(date);
}
