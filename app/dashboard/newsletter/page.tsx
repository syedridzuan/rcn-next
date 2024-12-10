import { Suspense } from 'react'
import { Metadata } from 'next'
import { NewsletterDashboard } from './newsletter-dashboard'
import { DashboardShell } from '@/components/shell'
import { DashboardHeader } from '@/components/header'
import { LoadingPage } from '@/components/loading'

export const metadata: Metadata = {
  title: 'Newsletter Management',
  description: 'Manage newsletter subscribers',
}

export default function NewsletterPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Newsletter Management"
        text="Manage your newsletter subscribers"
      />
      <Suspense fallback={<LoadingPage />}>
        <NewsletterDashboard />
      </Suspense>
    </DashboardShell>
  )
} 