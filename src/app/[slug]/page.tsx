'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export default function Page() {
  const { slug } = useParams()
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      const download_url = `https://raw.githubusercontent.com/rishi-gurjar/webpage/main/writings/${slug}.md`
      
      try {
        const response = await fetch(download_url)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.text()
        setContent(data)
      } catch (error) {
        console.error('Error fetching Markdown content:', error)
        setError('Failed to load content')
      }
    }

    fetchContent()
  }, [slug])

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!content) {
    return <div>Loading...</div>
  }

  return (
    <div className="markdown p-8 md:p-16 lg:p-24">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}