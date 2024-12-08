'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface PrintButtonProps {
  label?: string
}

export function PrintButton({ label = 'Cetak Resepi' }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
} 