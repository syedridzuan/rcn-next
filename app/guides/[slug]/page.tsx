import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { remark } from "remark"
import remarkHtml from "remark-html"
import remarkBreaks from "remark-breaks"
import { getGuideBySlug } from "@/lib/guides"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, MessageCircle, Tag, User } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const guide = await getGuideBySlug(slug)
  if (!guide) {
    return {
      title: "Guide Not Found | Guides",
      description: "This guide does not exist.",
    }
  }
  return {
    title: `${guide.title} | Guides`,
    description: guide.content?.slice(0, 150) || "A helpful guide",
    openGraph: {
      title: guide.title,
      description: guide.content?.slice(0, 150) || "A helpful guide",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.content?.slice(0, 150) || "A helpful guide",
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const guide = await getGuideBySlug(slug)

  if (!guide) {
    notFound()
  }

  // Convert guide.content (Markdown) to HTML if content exists
  let htmlContent = ""
  if (guide.content) {
    const normalizedContent = guide.content
      .replace(/\r\n/g, '\n')
      .replace(/\n\n/g, '\n&nbsp;\n')
      .trim()
    
    const file = await remark()
      .use(remarkBreaks)
      .use(remarkHtml, {
        sanitize: false,
        breaks: true,
      })
      .process(normalizedContent)
      
    htmlContent = file.toString()
    htmlContent = htmlContent.replace(/<p>/g, '<p class="mb-4">')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="flex mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary">Home</Link></li>
          <li>/</li>
          <li><Link href="/guides" className="hover:text-primary">Guides</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium truncate">{guide.title}</li>
        </ol>
      </nav>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{guide.title}</CardTitle>
          {guide.author && (
            <CardDescription className="flex items-center mt-2">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={guide.author.avatar || ''} alt={guide.author.name || 'Author'} />
                <AvatarFallback>{guide.author.name?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <span>{guide.author.name || 'Anonymous'}</span>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <CalendarIcon className="h-4 w-4 mr-1" />
              <time dateTime={guide.createdAt.toISOString()}>{guide.createdAt.toLocaleDateString()}</time>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {guide.images.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden">
                <Image
                  src={guide.images[0].url}
                  alt={guide.images[0].alt ?? guide.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="prose max-w-none">
            {guide.content ? (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              <p>No content provided for this guide.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              <Tag className="h-3 w-3 mr-1" />
              {tag.name}
            </Badge>
          ))}
        </CardFooter>
      </Card>

      {guide.sections.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Guide Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guide.sections.map((section, index) => (
                <li key={section.id} className="flex items-center">
                  <span className="mr-2 font-bold">{index + 1}.</span>
                  <span>{section.title}</span>
                  <Badge variant="outline" className="ml-2">{section.type}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {guide.comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              <MessageCircle className="h-5 w-5 inline-block mr-2" />
              Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {guide.comments.map((comment) => (
                <li key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={comment.user?.avatar || ''} alt={comment.user?.name || 'User'} />
                      <AvatarFallback>{comment.user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium mr-2">{comment.user?.name ?? "Anonymous"}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

