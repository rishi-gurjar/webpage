import Link from 'next/link';

type Book = {
  cover?: string;
  title: string;
  author: string;
  shelves?: string[];
  dateRead?: string;
};

async function getBooks(): Promise<Book[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const res = await fetch(`${base}/api/books`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.books as Book[];
}

export default async function BooksPage() {
  const books = await getBooks();
  
  // Sort books: currently reading first, then finished books
  const sortedBooks = books.sort((a, b) => {
    const aIsCurrentlyReading = a.dateRead === "not set";
    const bIsCurrentlyReading = b.dateRead === "not set";
    
    if (aIsCurrentlyReading && !bIsCurrentlyReading) return -1;
    if (!aIsCurrentlyReading && bIsCurrentlyReading) return 1;
    return 0;
  });

  return (
    <main className="container flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] w-full px-4">
      <Link href="/" className="self-start mb-4">← Back to home</Link>
      <h1 className="text-2xl text-[24px] font-['Young_Serif']">Books</h1>
      <br />

      <section className="w-full max-w-4xl">
        {!books.length && (
          <p className="text-sm text-gray-600">computer di Rishi lagi off :/</p>
        )}
        <ul>
          {sortedBooks.map((b, i) => (
            <li key={`${b.title}-${i}`} className="py-3 border-b border-gray-200">
              <div className="flex gap-3 items-start justify-between">
                <div className="flex gap-3 items-start flex-1">
                  {b.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover} alt={b.title} className="w-auto h-10 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h2 className="font-['Young_Serif'] leading-tight">{b.title}</h2>
                    <p className="text-sm text-gray-700">{b.author}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {b.dateRead != "not set" ? (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Finished on {b.dateRead}
                    </span>
                  ) : (
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                      Currently reading
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
