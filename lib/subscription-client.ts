// /lib/subscription-client.ts
export async function hasActiveSubscriptionClient(): Promise<boolean> {
  const res = await fetch("/api/subscription-check");
  if (!res.ok) return false;
  const data = await res.json();
  return data.isActive || false;
}
