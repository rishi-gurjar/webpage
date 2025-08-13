import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export type GoodreadsBook = {
  cover?: string;
  title: string;
  author: string;
  shelves?: string[];
  dateRead?: string;
};

const GOODREADS_URL = 'https://www.goodreads.com/review/list/143258693-rishi-gurjar?utf8=%E2%9C%93&per_page=100';

function toAbsoluteUrl(href: string | undefined | null, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function dedupeBooks(existing: GoodreadsBook[], incoming: GoodreadsBook[]): GoodreadsBook[] {
  const seen = new Set(existing.map(b => `${b.title}__${b.author}`.toLowerCase()));
  for (const book of incoming) {
    const key = `${book.title}__${book.author}`.toLowerCase();
    if (!seen.has(key)) {
      existing.push(book);
      seen.add(key);
    }
  }
  return existing;
}

export async function scrapeGoodreads(): Promise<GoodreadsBook[]> {
  const cookie = process.env.GOODREADS_COOKIE; // optional: paste browser cookie string
  const maxPages = Number(process.env.GOODREADS_MAX_PAGES || 50);
  const baseUrl = GOODREADS_URL;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.goodreads.com/',
    ...(cookie ? { Cookie: cookie } : {}),
  } as const;

  let currentUrl: string | null = baseUrl;
  let currentPage = 1;
  const allBooks: GoodreadsBook[] = [];

  while (currentUrl && currentPage <= maxPages) {
    const response = await axios.get(currentUrl, {
      headers,
      validateStatus: () => true,
    });

    if (!response.data || typeof response.data !== 'string') {
      console.warn(`[goodreads] non-html response at page ${currentPage}, status=${response.status}`);
      break;
    }

    const html = response.data as string;
    const $ = cheerio.load(html);

    // quick auth check
    const pageTitle = $('title').text();
    const authHint = $('form[action*="/user/sign_in"], #signInForm').length > 0 || /Sign in|Welcome back/i.test(html);
    if (authHint) {
      console.warn(`[goodreads] page may require auth. title="${pageTitle}" url=${currentUrl}`);
    }

    // Collect rows using multiple selectors
    const rows = $('table.tableList tr, table#books tr, tr.review, tr.bookalike');
    const sel1 = $('table.tableList tr').length;
    const sel2 = $('table#books tr').length;
    const sel3 = $('tr.review, tr.bookalike').length;
    //console.log(`[goodreads] page ${currentPage} row counts -> tableList: ${sel1}, #books: ${sel2}, .review: ${sel3}, total picked: ${rows.length}`);

    const pageBooks: GoodreadsBook[] = [];
    rows.each((_, el) => {
      const row = $(el);
      const cover = row.find('td.cover img').attr('src') || row.find('img.bookCover').attr('src');
      const title = row.find('td.field.title a.bookTitle').text().trim()
        || row.find('td.field.title a').first().text().trim()
        || row.find('a.bookTitle').first().text().trim();
      const author = row.find('td.field.author a.authorName').text().trim()
        || row.find('td.field.author a').first().text().trim()
        || row.find('a.authorName').first().text().trim();
      const shelvesLinks = row.find('td.field.shelves a').map((_, a) => $(a).text().trim()).get();
      const shelvesCell = shelvesLinks.length ? shelvesLinks.join(',') : row.find('td.field.shelves').text().trim();
      const shelves = shelvesCell ? shelvesCell.split(/[,/]/).map(s => s.trim()).filter(Boolean) : undefined;
      let dateRead = row.find('td.field.date_read').text().trim()
        || row.find('td.field.date_read .date_read_value').text().trim()
        || row.find('td.field.date_read div.value').text().trim();
      if (dateRead.toLowerCase().startsWith('date read')) {
        dateRead = dateRead.substring(9).trim();
      }
      if (title) {
        pageBooks.push({ cover, title, author, shelves, dateRead });
      }
    });

    dedupeBooks(allBooks, pageBooks);
    //console.log(`[goodreads] page ${currentPage} -> parsed ${pageBooks.length}, total ${allBooks.length}`);

    // Find next link
    const nextHref = (
      $('a.next_page[href]').attr('href')
      || $('a.next[href]').attr('href')
      || $('a[rel="next"][href]').attr('href')
      || $('li.next a[href]').attr('href')
    );
    let nextUrl = toAbsoluteUrl(nextHref, currentUrl);

    // Fallback: if no explicit next link, try incrementing page parameter
    if (!nextUrl) {
      const pageUrl: URL = new URL(currentUrl as string);
      const existingPage = Number(pageUrl.searchParams.get('page') || '1');
      pageUrl.searchParams.set('page', String(existingPage + 1));
      nextUrl = pageUrl.toString();
    }

    // If we failed to parse any rows, or no new books were added, stop to avoid loops
    if (pageBooks.length === 0) {
      //console.log('[goodreads] no rows parsed on this page; stopping.');
      break;
    }

    // Prepare next iteration
    currentUrl = nextUrl;
    currentPage += 1;
  }

  //console.log(`[goodreads] scraped books (all pages): ${allBooks.length}${allBooks.length ? ' | sample: ' + allBooks.slice(0, 3).map(b => b.title).join(' | ') : ''}`);
  return allBooks;
}

let cache: { books: GoodreadsBook[]; updatedAt: number } | null = null;

export async function getBooksCached(): Promise<GoodreadsBook[]> {
  // 24h cache
  const DAY_MS = 24 * 60 * 60 * 1000;
  if (cache && Date.now() - cache.updatedAt < DAY_MS) return cache.books;
  const books = await scrapeGoodreads();
  cache = { books, updatedAt: Date.now() };
  //console.log(`[goodreads] cache updated: ${books.length} books at ${new Date(cache.updatedAt).toISOString()}`);
  return books;
}

export function scheduleDailyScrape() {
  // Scrape once at startup and then daily
  getBooksCached().catch(() => {});
  const DAY_MS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    getBooksCached().catch(err => console.error('Goodreads scrape failed', err));
  }, DAY_MS);
}


