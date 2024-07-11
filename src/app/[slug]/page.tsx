import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

// This function generates the static params at build time
export async function generateStaticParams() {
  // const res = await fetch('https://api.github.com/repos/rishi-gurjar/webpage/contents/writings')
  // const files = await res.json()
  // const files_filtered = files
  // .filter((file: any) => file.name.endsWith('.md'))
  // .map((file: any) => ({
  //   slug: file.name.replace(/\.md$/, '')
  // }))
  // console.log(files_filtered)

  return [ 
  { slug: 'habeas' },
  { slug: 'gradient'},
  { slug: 'test'}
   ]
}

// This function generates metadata for the page
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: params.slug,
  }
}

// The page component
export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
  const download_url = `https://raw.githubusercontent.com/rishi-gurjar/webpage/main/writings/${slug}.md`

  let content: string

  try {
    const res = await fetch(download_url)
    if (!res.ok) {
      throw new Error('Failed to fetch content')
    }
    content = await res.text()
  } catch (error) {
    console.error('Error fetching Markdown content:', error)
    notFound()
  }

  return (
    <div className="markdown p-8 md:p-16 lg:p-24">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}