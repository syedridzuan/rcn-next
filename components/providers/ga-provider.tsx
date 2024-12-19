"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

export function GAProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
      window.dataLayer.push({
        event: 'page_view',
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render any UI
}