'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface ConditionalAdProps {
  contentLength?: number;
}

export function ConditionalAd({ contentLength }: ConditionalAdProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
      (window as any).adsbygoogle.push({})
    }
  }, [pathname])

  const isEligiblePath = (
    pathname.startsWith('/(ads-enabled)/resepi/') ||
    pathname.startsWith('/(ads-enabled)/kategori/') ||
    pathname.startsWith('/(ads-enabled)/guides/')
  )

  // For example, only show ads if content is sufficiently long.
  const hasEnoughContent = contentLength && contentLength > 500;

  if (!isEligiblePath || !hasEnoughContent) {
    return null
  }

  return (
    <div className="my-4 flex justify-center">
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2342126410838343"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
  )
}