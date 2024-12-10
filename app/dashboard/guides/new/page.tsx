import { DashboardShell } from '@/components/shell'
import { DashboardHeader } from '@/components/dashboard-header'
import { NewGuideForm } from './new-guide-form'

export const metadata = {
  title: 'New Guide',
  description: 'Create a new guide',
}

export default function NewGuidePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Guide"
        text="Add a new guide to your collection"
      />
      <div className="grid gap-8">
        <NewGuideForm />
      </div>
    </DashboardShell>
  )
} 