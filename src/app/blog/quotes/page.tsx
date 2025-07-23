import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { PageTracker } from '../PageTracker';

interface Quote {
  text: string;
  author: string;
  source: string;
}

async function getQuotes(): Promise<Quote[]> {
  try {
    const quotesPath = path.join(process.cwd(), 'src/quote-wall/quotes.md');
    const fileContents = fs.readFileSync(quotesPath, 'utf8');
    
    const quotes: Quote[] = fileContents
      .split('\n')
      .filter(line => line.trim() && line.includes('|'))
      .map(line => {
        const parts = line.split('|').map(part => part.trim());
        if (parts.length >= 3) {
          return {
            text: parts[0],
            author: parts[1],
            source: parts[2]
          };
        }
        return null;
      })
      .filter((quote): quote is Quote => quote !== null);

    return quotes;
  } catch (error) {
    console.error('Error reading quotes file:', error);
    return [];
  }
}

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <main className="container grid flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] lg:w-[calc(100vw/3)] md:w-[calc(100vw/3)] md:px-0">
      <PageTracker path="/blog/quotes" />
      <Link href="/blog" className="self-start mb-4">← Back to blog</Link>
      <h1 className="text-2xl text-[20px] font-mono">very-secret quote stash. don't panic. quotes may cause existential amusement.</h1>
      <br />
      
      <div className="w-full space-y-6">
        {quotes.length === 0 ? (
          <p className="text-gray-600 italic">No quotes :o</p>
        ) : (
          quotes.map((quote, index) => (
            <div key={index} className="pl-6 py-2 text-xs">
              <blockquote className="font-mono">
                "{quote.text}"
              </blockquote>
              <div className="text-xs text-black-600">
                <span className="font-medium">— {quote.author},</span>
                {quote.source && (
                  <span className="italic"> {quote.source}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <br />
    </main>
  );
} 