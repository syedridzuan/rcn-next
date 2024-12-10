import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { getGuideBySlug } from "@/lib/guides";
import remarkBreaks from "remark-breaks";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) {
    return {
      title: "Guide Not Found | Guides",
      description: "This guide does not exist.",
    };
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
  };
}

export default async function GuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  // Convert guide.content (Markdown) to HTML if content exists
  let htmlContent = "";
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex space-x-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/guides" className="hover:underline">
              Guides
            </Link>
          </li>
          <li>/</li>
          <li aria-current="page" className="font-semibold text-foreground">
            {guide.title}
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-foreground">{guide.title}</h1>

      {/* Move Images to the Top */}
      {guide.images.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {guide.images.map((img) => (
              <div key={img.id} className="border rounded p-2">
                <div className="relative aspect-video">
                  <Image
                    src={img.url}
                    alt={img.alt ?? guide.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                {img.alt && <p className="text-sm mt-2">{img.alt}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{guide.title}</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          {guide.content ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <p>No content provided for this guide.</p>
          )}
        </CardContent>
      </Card>

      {/* Author Section if available */}
      {guide.author && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Author</h2>
          <p>{guide.author.name ?? "Anonymous"}</p>
        </section>
      )}

      {/* Tags Section */}
      {guide.tags.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Tags</h2>
          <ul className="flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <li
                key={tag.id}
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
              >
                {tag.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sections List */}
      {guide.sections.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Sections</h2>
          <ul className="list-decimal list-inside space-y-1">
            {guide.sections.map((section) => (
              <li key={section.id} className="font-medium">
                {section.title}: {section.type}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Comments Section */}
      {guide.comments.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Comments</h2>
          <ul className="space-y-2">
            {guide.comments.map((comment) => (
              <li key={comment.id} className="p-2 border rounded">
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()} by{" "}
                  {comment.user?.name ?? "Anonymous"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
