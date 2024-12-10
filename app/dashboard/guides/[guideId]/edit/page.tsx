import { Suspense } from 'react'
import { Metadata } from 'next'
import { EditGuideForm } from './edit-guide-form'
import { DashboardShell } from '@/components/shell'
import { DashboardHeader } from '@/components/dashboard-header'
import { LoadingPage } from '@/components/loading'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

interface EditGuidePageProps {
  params: { guideId: string }
}

export const metadata: Metadata = {
  title: 'Edit Guide',
  description: 'Edit your guide content',
}

async function getGuide(guideId: Promise<string> | string) {
  const resolvedId = await guideId
  
  const guide = await prisma.guide.findUnique({
    where: { id: resolvedId },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      authorId: true,
      sections: {
        orderBy: {
          createdAt: 'asc'
        }
      },
      tags: true,
      images: {
        orderBy: { 
          isPrimary: 'desc' 
        }
      }
    }
  })

  if (!guide) notFound()

  return {
    ...guide,
    content: guide.content || '',
  }
}

export default async function EditGuidePage({ params }: EditGuidePageProps) {
  const guide = await getGuide(Promise.resolve(params.guideId))

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit Guide"
        text="Make changes to your guide content"
      />
      <div className="grid gap-8">
        <Suspense fallback={<LoadingPage />}>
          <EditGuideForm guide={guide} />
        </Suspense>
      </div>
    </DashboardShell>
  )
} 