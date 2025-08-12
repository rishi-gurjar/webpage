'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

type Book = {
  cover?: string;
  title: string;
  author: string;
  shelves?: string[];
  dateRead?: string;
};

async function getBooks(): Promise<Book[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${base}/api/books`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.books || []) as Book[];
  } catch {
    return [];
  }
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  // Sort books: currently reading first, then finished books
  const sortedBooks = books.sort((a, b) => {
    const aIsCurrentlyReading = a.dateRead === "not set";
    const bIsCurrentlyReading = b.dateRead === "not set";

    if (aIsCurrentlyReading && !bIsCurrentlyReading) return -1;
    if (!aIsCurrentlyReading && bIsCurrentlyReading) return 1;
    return 0;
  });

  // Group books by year for histogram view
  const booksByYear = books.reduce((acc, book) => {
    if (book.dateRead === "not set") {
      if (!acc["Currently Reading"]) acc["Currently Reading"] = [];
      acc["Currently Reading"].push(book);
    } else if (book.dateRead) {
      const year = new Date(book.dateRead).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(book);
    }
    return acc;
  }, {} as Record<string, Book[]>);

  const sortedYears = Object.keys(booksByYear).sort((a, b) => {
    if (a === "Currently Reading") return -1;
    if (b === "Currently Reading") return 1;
    return parseInt(b) - parseInt(a);
  });

  return (
    <main className="container flex flex-col items-center mt-[60px] lg:mt-[calc(100vh/5.5)] w-full px-4">
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <Link href="/" className="mb-4">← Back to home</Link>
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'graph' : 'list')}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          {viewMode === 'list' ? 'Year View' : 'List View'}
        </button>
      </div>
      <br />

      <section className="w-full max-w-4xl mb-8">
        {!books.length && (
          <p className="text-sm text-gray-600">computer di Rishi lagi off :/</p>
        )}

        {viewMode === 'list' ? (
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
                      <h2 className="font-mono leading-tight text-sm">{b.title}</h2>
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
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="flex items-end justify-center min-w-max gap-8 p-8" style={{ minHeight: '500px' }}>              
              {/* Graph bars */}
              <div className="flex items-end gap-6 h-full">
                {sortedYears.map((year) => {
                  const count = booksByYear[year].length;
                  const maxCount = Math.max(...Object.values(booksByYear).map(books => books.length));
                  const maxStackable = 20; // Maximum books to stack vertically
                  const shouldUseGrid = count > maxStackable;
                  
                  return (
                    <div key={year} className="flex flex-col items-center">
                      {/* Book display area */}
                      <div className="mb-2" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        {shouldUseGrid ? (
                          // Grid layout for many books
                          <div className="grid grid-cols-3 gap-1 max-w-32">
                            {booksByYear[year].map((book, i) => (
                              <div key={`${book.title}-${i}`} className="group relative">
                                {book.cover ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img 
                                    src={book.cover} 
                                    alt={book.title} 
                                    className="w-8 h-12 object-cover rounded shadow-sm hover:shadow-md transition-all hover:scale-110 hover:z-10"
                                  />
                                ) : (
                                  <div className="w-8 h-12 bg-gray-300 rounded flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110 hover:z-10">
                                    <span className="text-xs text-gray-600 text-center px-1 leading-none">
                                      {book.title.substring(0, 3)}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute left-full ml-2 bottom-0 bg-black bg-opacity-90 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                  <div className="font-semibold">{book.title}</div>
                                  <div className="text-gray-300">{book.author}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Stacked layout for fewer books
                          <div className="flex flex-col-reverse items-center gap-1">
                            {booksByYear[year].map((book, i) => (
                              <div key={`${book.title}-${i}`} className="group relative">
                                {book.cover ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img 
                                    src={book.cover} 
                                    alt={book.title} 
                                    className="w-8 h-12 object-cover rounded shadow-sm hover:shadow-md transition-all hover:scale-110 hover:z-10"
                                  />
                                ) : (
                                  <div className="w-8 h-12 bg-gray-300 rounded flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110 hover:z-10">
                                    <span className="text-xs text-gray-600 text-center px-1 leading-none">
                                      {book.title.substring(0, 3)}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute left-full ml-2 bottom-0 bg-black bg-opacity-90 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                  <div className="font-semibold">{book.title}</div>
                                  <div className="text-gray-300">{book.author}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Count label */}
                      <div className="text-sm font-mono text-gray-700 mb-1">
                        {count}
                      </div>
                      
                      {/* Year label */}
                      <div className="text-sm font-mono text-gray-800 origin-left">
                        {year}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* X-axis label */}
            <div className="text-center mt-4">
              <div className="text-sm text-gray-600 font-mono">Year</div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
