import { Suspense } from 'react'
import { Metadata } from 'next'
import { DashboardShell } from '@/components/shell'
import { DashboardHeader } from '@/components/dashboard-header'
import { LoadingPage } from '@/components/loading'
import { ImageManager } from './image-manager'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'

interface GuideImagesPageProps {
  params: { guideId: string }
}

export const metadata: Metadata = {
  title: 'Manage Guide Images',
  description: 'Upload and manage images for your guide',
}

async function getGuide(guideId: string) {
  const guide = await prisma.guide.findUnique({
    where: { id: guideId },
    select: {
      id: true,
      title: true,
      images: {
        orderBy: {
          isPrimary: 'desc',
        },
      },
    },
  })

  if (!guide) notFound()

  return guide
}

export default async function GuideImagesPage({ params }: GuideImagesPageProps) {
  const resolvedParams = await Promise.resolve(params)
  const guide = await getGuide(resolvedParams.guideId)

  return (
    <DashboardShell>
      <Breadcrumbs
        items={[
          { label: 'Guides', href: '/dashboard/guides' },
          { label: guide.title, href: `/dashboard/guides/${guide.id}/edit` },
          { label: 'Images', href: `/dashboard/guides/${guide.id}/images` },
        ]}
      />
      <DashboardHeader
        heading="Guide Images"
        text={`Manage images for ${guide.title}`}
      />
      <div className="grid gap-8">
        <Suspense fallback={<LoadingPage />}>
          <ImageManager 
            guideId={guide.id} 
            initialImages={guide.images}
          />
        </Suspense>
      </div>
    </DashboardShell>
  )
} 